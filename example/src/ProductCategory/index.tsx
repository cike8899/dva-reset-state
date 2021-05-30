import React, { useCallback, useEffect } from 'react'
import { useDispatch } from 'dva_2.6.0-beta.20'

import { useResetState } from 'dva-reset-state'

const initialList = [
  { id: 1, title: '台灯' },
  { id: 2, title: '杀菌灯' },
  { id: 3, title: '吸顶灯' },
  { id: 4, title: '吊灯' }
]

const ProductCategory = () => {
  const dispatch = useDispatch()

  const fetchList = useCallback(() => {
    dispatch({ type: 'productCategory/setList', payload: initialList })
  }, [dispatch])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useResetState(dispatch, { productCategory: 'list' })

  return <div>ProductCategory</div>
}

export default ProductCategory
