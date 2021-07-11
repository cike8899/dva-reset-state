import {
  resetInitialReducer,
  resetStateWillOnmount,
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
  resetStateWillOnmount,
  useResetStateWillUnmount,
  useResetState,
  reset
}

export default createResetState
