import { resetInitialReducer } from './resetState'

const createResetState = () => {
  return {
    onReducer: resetInitialReducer
  }
}

export default createResetState
