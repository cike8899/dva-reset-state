import {
  resetInitialReducer,
  resetState,
  useResetStateWillUnmount,
  useResetState,
  reset
} from './resetState'

const createResetState = () => {
  return {
    onReducer: resetInitialReducer
  }
}

export {
  createResetState,
  resetState,
  useResetStateWillUnmount,
  useResetState,
  reset
}

export default createResetState
