import { Model } from 'dva'

const model: Model = {
  namespace: 'editProduct',
  state: { productInfo: { title: '笔记本', price: 10 }, user: 'geek' },
  reducers: {
    alterProductInfo(state, action) {
      return {
        ...state,
        productInfo: action['payload']
      }
    }
  }
}

export default model
