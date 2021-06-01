import { Model } from 'dva'

const model: Model = {
  namespace: 'productCategory',
  state: {
    list: [],
    total: 0
  },
  reducers: {
    setList(state, action) {
      return {
        ...state,
        list: action['payload']
      }
    }
  }
}

export default model
