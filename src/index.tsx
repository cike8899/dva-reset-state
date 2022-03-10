import {
  resetInitialReducer,
  resetStateWillUnmount,
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
  resetStateWillUnmount,
  useResetStateWillUnmount,
  useResetState,
  reset
}

export default createResetState
