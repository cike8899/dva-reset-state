import { createStore, Store } from 'redux'
import { createStore as createStoreNext } from 'redux-4.x'
import { resetInitialReducer, reset } from '../resetState'
import { initialState } from '../__mockData__/state.constant'

const packages = {
  '3.x': createStore,
  '4.x': createStoreNext
}

const reduxVersion = process.env.REACT_APP_REDUX_VERSION || '3.x'

const createStoreLast = packages[reduxVersion]
const rootReducer = (
  state = initialState,
  action: { type: string; [extraProps: string]: any }
) => {
  switch (action.type) {
    case 'productList/setProductList':
      return {
        ...state,
        productList: {
          ...state.productList,
          list: action.payload
        }
      }

    case 'productList/setProdcutListPage':
      return {
        ...state,
        productList: {
          ...state.productList,
          pageInfo: action.payload
        }
      }

    case 'editProduct/alterProductInfo':
      return {
        ...state,
        editProduct: {
          ...state.editProduct,
          productInfo: action.payload
        }
      }

    case 'userList/alterUserList':
      return {
        ...state,
        userList: action.payload
      }

    default:
      return state
  }
}

let store: Store<any>
beforeEach(() => {
  store = createStoreLast(resetInitialReducer(rootReducer))
})

describe('restState', () => {
  it('reset one field of namespace state', () => {
    const mockFn = jest.fn(() => {
      const ret: any = store.getState()
      return ret.productList.list
    })
    store.subscribe(mockFn)

    // 修改数据
    store.dispatch({
      type: 'productList/setProductList',
      payload: [{ id: 1, title: 'geek' }]
    })

    // 重置productList下的list
    reset(store.dispatch, { productList: 'list' })

    expect(mockFn).toBeCalledTimes(2)
    expect(mockFn).toHaveNthReturnedWith(1, [{ id: 1, title: 'geek' }])
    expect(mockFn).toHaveNthReturnedWith(2, [])
  })

  it('reset multipe field of one namespace', () => {
    const mockFn = jest.fn(() => {
      const ret: any = store.getState()
      return ret.productList
    })
    store.subscribe(mockFn)

    // 修改数据
    store.dispatch({
      type: 'productList/setProdcutListPage',
      payload: { pageSize: 7 }
    })
    store.dispatch({
      type: 'productList/setProductList',
      payload: [{ id: 2, title: 'xin' }]
    })

    // 重置productList下的list
    reset(store.dispatch, { productList: ['list', 'pageInfo'] })

    expect(mockFn).toBeCalledTimes(3)
    expect(mockFn).toHaveNthReturnedWith(1, {
      ...initialState.productList,
      pageInfo: { pageSize: 7 }
    })
    expect(mockFn).toHaveNthReturnedWith(2, {
      ...initialState.productList,
      pageInfo: { pageSize: 7 },
      list: [{ id: 2, title: 'xin' }]
    })
    expect(mockFn).toHaveNthReturnedWith(3, initialState.productList)
  })

  it('reset whole namespace state', () => {
    const mockFn = jest.fn(() => {
      const ret: any = store.getState()
      return ret.productList
    })
    store.subscribe(mockFn)

    // 修改数据
    store.dispatch({
      type: 'productList/setProductList',
      payload: [{ id: 1, title: 'geek' }]
    })

    //通过namespace， 重置namespace下的所有状态
    reset(store.dispatch, 'productList')

    expect(mockFn).toBeCalledTimes(2)
    expect(mockFn).toHaveNthReturnedWith(1, {
      ...initialState.productList,
      list: [{ id: 1, title: 'geek' }]
    })
    expect(mockFn).toHaveNthReturnedWith(2, initialState.productList)
  })

  it('reset partial fileds of two namespace', () => {
    const mockFn = jest.fn(() => {
      const ret: any = store.getState()
      return ret
    })
    store.subscribe(mockFn)

    // 修改数据
    store.dispatch({
      type: 'productList/setProductList',
      payload: [{ id: 1, title: 'geek' }]
    })

    store.dispatch({
      type: 'editProduct/alterProductInfo',
      payload: {
        id: 1,
        name: 'default',
        description: 'system default project',
        createTime: '2019-12-09T02:18:29Z',
        modTime: '2020-06-08T06:59:51Z'
      }
    })

    //通过namespace， 重置namespace下的所有状态
    reset(store.dispatch, { productList: 'list', editProduct: 'productInfo' })

    expect(mockFn).toBeCalledTimes(3)
    expect(mockFn).toHaveNthReturnedWith(1, {
      ...initialState,
      productList: {
        ...initialState.productList,
        list: [{ id: 1, title: 'geek' }]
      }
    })
    expect(mockFn).toHaveNthReturnedWith(2, {
      ...initialState,
      productList: {
        ...initialState.productList,
        list: [{ id: 1, title: 'geek' }]
      },
      editProduct: {
        ...initialState.editProduct,
        productInfo: {
          id: 1,
          name: 'default',
          description: 'system default project',
          createTime: '2019-12-09T02:18:29Z',
          modTime: '2020-06-08T06:59:51Z'
        }
      }
    })

    expect(mockFn).toHaveNthReturnedWith(3, initialState)
  })

  it('reset all filed of one and partial data of the other one ', () => {
    const mockFn = jest.fn(() => {
      const ret: any = store.getState()
      return ret
    })
    store.subscribe(mockFn)

    // 修改数据
    store.dispatch({
      type: 'productList/setProductList',
      payload: [{ id: 1, title: 'geek' }]
    })

    store.dispatch({
      type: 'productList/setProdcutListPage',
      payload: { pageSize: 7 }
    })

    store.dispatch({
      type: 'editProduct/alterProductInfo',
      payload: {
        id: 1,
        name: 'default',
        description: 'system default project',
        createTime: '2019-12-09T02:18:29Z',
        modTime: '2020-06-08T06:59:51Z'
      }
    })

    store.dispatch({
      type: 'userList/alterUserList',
      payload: [{ id: 1, name: 'balibabu' }]
    })

    //通过namespace，重置userList下的所有状态,重置productList跟editProduct下部分状态
    reset(store.dispatch, ['userList', { productList: ['list', 'pageInfo'] }])

    expect(mockFn).toBeCalledTimes(5)

    expect(mockFn).toHaveNthReturnedWith(1, {
      ...initialState,
      productList: {
        ...initialState.productList,
        list: [{ id: 1, title: 'geek' }]
      }
    })

    expect(mockFn).toHaveNthReturnedWith(2, {
      ...initialState,
      productList: {
        ...initialState.productList,
        list: [{ id: 1, title: 'geek' }],
        pageInfo: {
          pageSize: 7
        }
      }
    })

    expect(mockFn).toHaveNthReturnedWith(3, {
      ...initialState,
      productList: {
        ...initialState.productList,
        list: [{ id: 1, title: 'geek' }],
        pageInfo: {
          pageSize: 7
        }
      },
      editProduct: {
        ...initialState.editProduct,
        productInfo: {
          id: 1,
          name: 'default',
          description: 'system default project',
          createTime: '2019-12-09T02:18:29Z',
          modTime: '2020-06-08T06:59:51Z'
        }
      }
    })
    expect(mockFn).toHaveNthReturnedWith(4, {
      productList: {
        ...initialState.productList,
        list: [{ id: 1, title: 'geek' }],
        pageInfo: {
          pageSize: 7
        }
      },
      editProduct: {
        ...initialState.editProduct,
        productInfo: {
          id: 1,
          name: 'default',
          description: 'system default project',
          createTime: '2019-12-09T02:18:29Z',
          modTime: '2020-06-08T06:59:51Z'
        }
      },
      userList: [{ id: 1, name: 'balibabu' }]
    })
    expect(mockFn).toHaveNthReturnedWith(5, {
      ...initialState,
      editProduct: {
        ...initialState.editProduct,
        productInfo: {
          id: 1,
          name: 'default',
          description: 'system default project',
          createTime: '2019-12-09T02:18:29Z',
          modTime: '2020-06-08T06:59:51Z'
        }
      }
    })
  })

  it('reset all', () => {
    const mockFn = jest.fn(() => {
      const ret: any = store.getState()
      return ret
    })
    store.subscribe(mockFn)

    // 修改数据
    store.dispatch({
      type: 'productList/setProductList',
      payload: [{ id: 1, title: 'geek' }]
    })

    store.dispatch({
      type: 'editProduct/alterProductInfo',
      payload: {
        id: 1,
        name: 'default',
        description: 'system default project',
        createTime: '2019-12-09T02:18:29Z',
        modTime: '2020-06-08T06:59:51Z'
      }
    })

    //通过namespace， 重置namespace下的所有状态
    reset(store.dispatch) // 不传递namespace则重置所有state

    expect(mockFn).toBeCalledTimes(3)
    expect(mockFn).toHaveNthReturnedWith(1, {
      ...initialState,
      productList: {
        ...initialState.productList,
        list: [{ id: 1, title: 'geek' }]
      }
    })
    expect(mockFn).toHaveNthReturnedWith(2, {
      ...initialState,
      productList: {
        ...initialState.productList,
        list: [{ id: 1, title: 'geek' }]
      },
      editProduct: {
        ...initialState.editProduct,
        productInfo: {
          id: 1,
          name: 'default',
          description: 'system default project',
          createTime: '2019-12-09T02:18:29Z',
          modTime: '2020-06-08T06:59:51Z'
        }
      }
    })

    expect(mockFn).toHaveNthReturnedWith(3, initialState)
  })

  it('reset inexistent namespace', () => {
    expect(() => {
      reset(store.dispatch, 'xxxx')
    }).toThrow(Error)
  })
  it('reset inexistent namespace array', () => {
    expect(() => {
      reset(store.dispatch, ['xxxx', 'productList'])
    }).toThrow(Error)
  })

  it('reset inexistent field', () => {
    expect(() => {
      reset(store.dispatch, { productList: 'biu' })
    }).toThrow(Error)
  })

  it('reset inexistent namespace and field', () => {
    expect(() => {
      reset(store.dispatch, { ooo: 'biu' })
    }).toThrow(Error)
  })

  it('reset inexistent fields', () => {
    expect(() => {
      reset(store.dispatch, { productList: ['list', 'piu'] })
    }).toThrow(Error)
  })
})
