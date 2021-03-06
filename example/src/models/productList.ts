import { Model } from 'dva'

const model: Model = {
  namespace: 'productList',
  state: {
    list: [],
    total: 0,
    pageInfo: {
      pageSize: 10
    }
  },
  reducers: {
    setProductList(state, action) {
      return {
        ...state,
        list: action['payload']
      }
    },
    setProdcutListPage(state, action) {
      return {
        ...state,
        pageInfo: action['payload']
      }
    }
  }
}

export default model
