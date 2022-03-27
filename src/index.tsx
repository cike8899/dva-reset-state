import {
  resetInitialReducer,
  resetStateWillUnmount,
  useResetStateWillUnmount,
  useResetState,
  reset
} from './resetState'

const createResetState = (shouldReturnNewObj: boolean = false) => {
  return {
    onReducer: resetInitialReducer(shouldReturnNewObj)
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
