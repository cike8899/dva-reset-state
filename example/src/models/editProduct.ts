import { Model } from 'dva_2.6.0-beta.20'

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
