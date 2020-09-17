import { resetInitialReducer, resetState, useResetState } from './resetState'

const createResetState = () => {
  return {
    onReducer: resetInitialReducer
  }
}

export { resetState, useResetState }

export default createResetState
