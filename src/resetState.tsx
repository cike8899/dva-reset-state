import React, { useEffect } from 'react'

import { isObject, pick } from './utils'

export const resetType = '@@reset'

export interface Action {
  type: any
}

export interface AnyAction extends Action {
  // Allows any extra properties to be defined in an action.
  [extraProps: string]: any
}

type Reducer<S> = (state: S, action: AnyAction) => S

type NamespaceOrFiled = string | string[] | { [key: string]: string | string[] }

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
  payload?: NamespaceOrFiled
) => {
  if (dispatch) {
    dispatch({ type: resetType, payload: payload })
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
    if (action.type === '@@INIT' || action.type === '@@redux/INIT') {
      initialState = newState // 缓存所有初始state
    }

    if (action.type === resetType) {
      const { payload } = action
      checkNamespaceOrField(payload, initialState)
      if (payload === undefined) {
        // 重置所有state
        newState = initialState
      } else if (typeof payload === 'string') {
        // 重置单个namespace
        newState = {
          ...newState,
          [payload]: initialState[payload]
        }
      } else if (Array.isArray(payload)) {
        // 重置多个namespace
        newState = {
          ...newState,
          ...pick(initialState, payload)
        }
      } else if (isObject(payload)) {
        // 重置多个namespace下的多个字段
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
      }
    }

    return newState
  }
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
  field: string,
  obj: { [key: string]: any },
  text?: string
) => {
  if (!(field in obj)) {
    throw new Error(`${text || field}不存在`)
  }
}
