import React, { useEffect } from 'react'
import { useDispatch } from 'dva'

import { isObject, pick, merge, omit } from './utils'

export const resetType = '@@reset'

export interface Action {
  type: any
}

export interface AnyAction extends Action {
  // Allows any extra properties to be defined in an action.
  [extraProps: string]: any
}

type Reducer<S> = (state: S, action: AnyAction) => S

type NamespaceWithPartialField = { [key: string]: string | string[] }

type NamespaceOrFiled =
  | string
  | string[]
  | NamespaceWithPartialField
  | (NamespaceWithPartialField | string)[]

interface ICommonObject {
  [key: string]: any
}

interface CommonAction {
  type: string
  payload?: any
}

interface PayloadDispatch<S = any> {
  <A extends CommonAction>(action: A): S extends Promise<any> ? S : A
}

export const reset = (
  dispatch: PayloadDispatch,
  payload?: NamespaceOrFiled,
  isOmitted = false
) => {
  if (dispatch) {
    dispatch({ type: resetType, payload: { data: payload, isOmitted } })
  }
}

// 还原namespace下所有state或某些字段
export const resetStateWillUnmount = (
  namespaces?: NamespaceOrFiled,
  isOmitted?: boolean
) => (WrappedComponent: React.ComponentClass) => {
  return class ResetState extends React.PureComponent<any> {
    componentWillUnmount() {
      const { dispatch } = this.props
      reset(dispatch, namespaces, isOmitted)
    }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }
}

// 组件销毁前，还原namespace下所有state或某些字段
export const useResetStateWillUnmount = (
  namespaces?: NamespaceOrFiled,
  isOmitted?: boolean
) => {
  const dispatch = useDispatch()
  useEffect(() => {
    return () => {
      reset(dispatch, namespaces, isOmitted)
    }
  }, [dispatch])
}

// 还原namespace下所有state或某些字段
export const useResetState = () => {
  const dispatch = useDispatch()
  return (namespaces?: NamespaceOrFiled, isOmitted?: boolean) => {
    reset(dispatch, namespaces, isOmitted)
  }
}

// 重置state到初始状态
export const resetInitialReducer = (shouldReturnNewObj: boolean = false) => (
  reducer: Reducer<any>
) => {
  let initialState: any = null
  return (state: any, action: any) => {
    let newState: any = reducer(state, action)
    // 为了解决redux devtools 发出PERFORM_ACTION将redux 的@@redux/INIT覆盖掉
    if (action.type === '@@INIT' || action.type.startsWith('@@redux/INIT')) {
      initialState = newState // 缓存所有初始state
    }

    if (action.type === resetType) {
      const {
        payload: { data, isOmitted }
      } = action
      checkNamespaceOrField(data, initialState)
      if (data === undefined) {
        // 重置所有state
        newState = shallowCopyStateByFlag(initialState, shouldReturnNewObj)
      } else if (typeof data === 'string') {
        if (isOmitted) {
          // 重置除了该namespace下的其他state
          newState = {
            ...newState,
            ...shallowCopyStateByFlag(
              omit(initialState, [data]),
              shouldReturnNewObj
            )
          }
        } else {
          // 重置单个namespace
          newState = {
            ...newState,
            ...shallowCopyStateByFlag(
              { [data]: initialState[data] },
              shouldReturnNewObj
            )
          }
        }
      } else if (Array.isArray(data)) {
        const mergedNamespaceObj = mergeNamespace(data) // 将带有字段的namespace对象聚合到一个对象
        const stringNameSpace = data.filter((x) => typeof x === 'string') // 筛选出所有string namespace
        if (isOmitted) {
          const allNamespace = Object.keys(initialState)
          // 重置除了数组中给定的namespace跟namespace对应字段外的其他namespace下的数据
          const shouldUpdateNamespaceObj = getOtherNamespaceFieldsObjExceptGivenFields(
            mergedNamespaceObj,
            initialState
          )
          const shouldUpdateStringFields = allNamespace.filter(
            (namespace) =>
              Object.keys(shouldUpdateNamespaceObj).every(
                (x) => x !== namespace
              ) && stringNameSpace.every((x) => x !== namespace)
          )

          newState = updateStateByObj(
            updateStateByStringArray(
              newState,
              shouldUpdateStringFields,
              initialState,
              shouldReturnNewObj
            ),
            shouldUpdateNamespaceObj,
            initialState,
            shouldReturnNewObj
          )
        } else {
          // 重置多个namespace 包括重置某些namespace下的所有字段，重置某些namespace下的部分字段
          newState = updateStateByObj(
            updateStateByStringArray(
              newState,
              data.filter((x) => typeof x === 'string'),
              initialState,
              shouldReturnNewObj
            ),
            mergeNamespace(data),
            initialState,
            shouldReturnNewObj
          )
        }
      } else if (isObject(data)) {
        if (isOmitted) {
          newState = updateAnotherStateExceptGivenFields(
            newState,
            data,
            initialState,
            shouldReturnNewObj
          )
          // 重置给定对象外的其他state
        } else {
          // 重置多个namespace下的多个字段
          newState = updateStateByObj(
            newState,
            data,
            initialState,
            shouldReturnNewObj
          )
        }
      }
    }

    return newState
  }
}

// 将namespace分散在不同对象下的namespace聚合到一个对象
export const mergeNamespace = (data: any[]) => {
  return merge(data.filter((x) => isObject(x)))
}

// 根据namespace为string的数组重置状态
const updateStateByStringArray = (
  newState: any,
  payload: string[],
  initialState: any,
  shouldReturnNewObj: boolean
) => {
  return {
    ...newState,
    ...shallowCopyStateByFlag(pick(initialState, payload), shouldReturnNewObj)
  }
}

// 重置多个namespace下的多个字段
const updateStateByObj = (
  newState: any,
  payload: NamespaceWithPartialField,
  initialState: any,
  shouldReturnNewObj: boolean = false
) => {
  newState = { ...newState }
  Object.keys(payload).forEach((namespace) => {
    newState[namespace] = {
      ...newState[namespace],
      ...updateObjByFields(
        payload[namespace],
        initialState[namespace],
        newState[namespace],
        shouldReturnNewObj
      )
    }
  })

  return newState
}

// 获取给定namespace下字段之外的字段
const getOtherNamespaceFieldsObjExceptGivenFields = (
  payload: NamespaceWithPartialField,
  initialState: any
) => {
  // 排除给定namespace下给定的字段
  const shouldUpdateNamespaceObj = Object.keys(payload).reduce(
    (pre, namespace) => {
      const shouldOmittFields = payload[namespace] // 传递过来的该namespace下的fields
      const objWithAllFields = initialState[namespace] // 该namespace下的包含所有字段的对象
      const objWithShouldUpdateFields = omit(
        objWithAllFields,
        shouldOmittFields
      )
      const shouldUpdateFields = Object.keys(objWithShouldUpdateFields)
      if (shouldUpdateFields.length > 0) {
        pre[namespace] = shouldUpdateFields
      }
      return pre
    },
    {}
  )
  return shouldUpdateNamespaceObj
}

// 重置给定对象外的其他state
const updateAnotherStateExceptGivenFields = (
  newState: any,
  payload: NamespaceWithPartialField,
  initialState: any,
  shouldReturnNewObj: boolean
) => {
  const allNamespace = Object.keys(initialState)
  // 排除给定namespace下给定的字段
  const shouldUpdateNamespaceObj = getOtherNamespaceFieldsObjExceptGivenFields(
    payload,
    initialState
  )

  return updateStateByObj(
    updateStateByStringArray(
      newState,
      allNamespace.filter((x) =>
        Object.keys(shouldUpdateNamespaceObj).every((y) => y !== x)
      ),
      initialState,
      shouldReturnNewObj
    ),
    shouldUpdateNamespaceObj,
    initialState,
    shouldReturnNewObj
  )
}

const updateObjByFields = (
  shouldBeUpdatedFields: string[] | string,
  initialNamespaceState: ICommonObject,
  newNamespaceState: ICommonObject,
  shouldReturnNewObj: boolean
) => {
  return Object.keys(newNamespaceState).reduce((pre, cur) => {
    pre[cur] = shouldBeUpdatedFields.includes(cur)
      ? getInitialFieldValueByFlag(
          initialNamespaceState,
          cur,
          shouldReturnNewObj
        )
      : newNamespaceState[cur]
    return pre
  }, {})
}

// 对给定部分namespace下的所有字段进行浅复制
const shallowCopyStateByFlag = (
  state: Record<string, any>,
  shouldReturnNewObj: boolean
) => {
  if (shouldReturnNewObj) {
    return Object.keys(state).reduce((pre, namespace) => {
      const initialNamespaceState = state[namespace]
      pre[namespace] = shallowCopyAllFieldsOfOneNamespace(initialNamespaceState)

      return pre
    }, {})
  }

  return state
}
// 浅复制某个namespace下的所有字段
const shallowCopyAllFieldsOfOneNamespace = (state: Record<string, any>) => {
  return Object.keys(state).reduce((pre, field) => {
    pre[field] = getInitialFieldValueByFlag(state, field, true)
    return pre
  }, {})
}

// 根据参数判断确定是否需要返回新的对象
const getInitialFieldValueByFlag = (
  initialNamespaceState: Record<string, any>,
  field: string,
  shouldReturnNewObj: boolean
) => {
  const initialValue = initialNamespaceState[field]
  if (shouldReturnNewObj) {
    if (isObject(initialValue)) {
      return { ...initialValue }
    } else if (Array.isArray(initialValue)) {
      return [...initialValue]
    }
  }

  return initialValue
}

const checkNamespaceOrField = (
  namespaceOrFiled: NamespaceOrFiled,
  obj: { [key: string]: any }
) => {
  if (typeof namespaceOrFiled === 'string') {
    throwError(namespaceOrFiled, obj)
  } else if (Array.isArray(namespaceOrFiled)) {
    namespaceOrFiled.forEach((namespace) => {
      throwError(namespace, obj)
    })
  } else if (isObject(namespaceOrFiled)) {
    Object.keys(namespaceOrFiled).forEach((namespace) => {
      throwError(namespace, obj)
      const namespaceObj = obj[namespace]
      const fields = namespaceOrFiled[namespace]
      if (typeof fields === 'string') {
        throwError(fields, namespaceObj, `${namespace}.${fields}`)
      }

      if (Array.isArray(fields)) {
        fields.forEach((field) => {
          throwError(field, namespaceObj, `${namespace}.${field}`)
        })
      }
    })
  }
}

const throwError = (
  field: string | NamespaceWithPartialField,
  obj: { [key: string]: any },
  text?: string
) => {
  if (typeof field === 'string') {
    if (!(field in obj)) {
      throw new Error(`${text || field}不存在`)
    }
  } else {
    Object.keys(field).forEach((x) => {
      throwError(x, obj, text)
    })
  }
}
