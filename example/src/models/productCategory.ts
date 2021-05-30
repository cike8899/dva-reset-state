import { Model } from 'dva_2.6.0-beta.20'

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
