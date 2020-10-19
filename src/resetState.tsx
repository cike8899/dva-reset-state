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
export const resetState = (namespaces?: NamespaceOrFiled) => (
  WrappedComponent: React.ComponentClass
) => {
  return class ResetState extends React.PureComponent<any> {
    componentWillUnmount() {
      const { dispatch } = this.props
      reset(dispatch, namespaces)
    }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }
}

// 还原namespace下所有state或某些字段
export const useResetState = (
  dispatch: PayloadDispatch,
  namespaces?: NamespaceOrFiled
) => {
  useEffect(() => {
    return () => {
      reset(dispatch, namespaces)
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
        // 重置多个namespace 包括重置某些namespace下的所有字段，重置某些namespace下的部分字段
        newState = updateStateByObj(
          {
            ...newState,
            ...pick(
              initialState,
              data.filter((x) => typeof x === 'string')
            )
          },
          merge(data.filter((x) => isObject(x))),
          initialState
        )
      } else if (isObject(data)) {
        // 重置多个namespace下的多个字段
        newState = updateStateByObj(newState, data, initialState)
      }
    }

    return newState
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
