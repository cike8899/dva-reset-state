import {
  resetInitialReducer,
  resetState,
  useResetState,
  reset
} from './resetState'

const createResetState = () => {
  return {
    onReducer: resetInitialReducer
  }
}

export { createResetState, resetState, useResetState, reset }

export default createResetState
