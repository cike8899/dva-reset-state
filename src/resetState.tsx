import React, { useEffect } from 'react'

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
export const resetState = (
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

// 还原namespace下所有state或某些字段
export const useResetState = (
  dispatch: PayloadDispatch,
  namespaces?: NamespaceOrFiled,
  isOmitted?: boolean
) => {
  useEffect(() => {
    return () => {
      reset(dispatch, namespaces, isOmitted)
    }
  }, [dispatch, namespaces])
}

// 重置state到初始状态
export const resetInitialReducer: (reducer: Reducer<any>) => any = (
  reducer
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
        newState = initialState
      } else if (typeof data === 'string') {
        if (isOmitted) {
          // 重置除了该namespace下的其他state
          newState = {
            ...newState,
            ...omit(initialState, [data])
          }
        } else {
          // 重置单个namespace
          newState = {
            ...newState,
            [data]: initialState[data]
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
              initialState
            ),
            shouldUpdateNamespaceObj,
            initialState
          )
        } else {
          // 重置多个namespace 包括重置某些namespace下的所有字段，重置某些namespace下的部分字段
          newState = updateStateByObj(
            updateStateByStringArray(
              newState,
              data.filter((x) => typeof x === 'string'),
              initialState
            ),
            mergeNamespace(data),
            initialState
          )
        }
      } else if (isObject(data)) {
        if (isOmitted) {
          newState = updateAnotherStateExceptGivenFields(
            newState,
            data,
            initialState
          )
          // 重置给定对象外的其他state
        } else {
          // 重置多个namespace下的多个字段
          newState = updateStateByObj(newState, data, initialState)
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
  initialState: any
) => {
  return {
    ...newState,
    ...pick(initialState, payload)
  }
}

// 重置多个namespace下的多个字段
const updateStateByObj = (
  newState: any,
  payload: NamespaceWithPartialField,
  initialState: any
) => {
  newState = { ...newState }
  Object.keys(payload).forEach((namespace) => {
    newState[namespace] = {
      ...newState[namespace],
      ...updateObjByPath(
        payload[namespace],
        initialState[namespace],
        newState[namespace]
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
  initialState: any
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
      initialState
    ),
    shouldUpdateNamespaceObj,
    initialState
  )
}

const updateObjByPath = (
  path: string[] | string,
  values: ICommonObject,
  obj: ICommonObject
) => {
  return Object.keys(obj).reduce((pre, cur) => {
    pre[cur] = path.includes(cur) ? values[cur] : obj[cur]
    return pre
  }, {})
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
