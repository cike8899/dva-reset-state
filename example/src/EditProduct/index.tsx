import React from 'react'
import { useDispatch, useSelector } from 'dva'
import { useResetStateWillUnmount, useResetState } from 'dva-reset-state'

const EditProduct = () => {
  const dispatch = useDispatch()
  const productInfo = useSelector((state: any) => state.editProduct.productInfo)
  useResetStateWillUnmount('editProduct')

  const resetState = useResetState()

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'editProduct/alterProductInfo',
      payload: {
        ...productInfo,
        title: e.target.value
      }
    })
  }

  const onPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'editProduct/alterProductInfo',
      payload: {
        ...productInfo,
        price: e.target.value
      }
    })
  }

  const handleClick = () => {
    resetState('editProduct')
  }

  return (
    <form action=''>
      <div>
        <label htmlFor=''>title</label>
        <input
          type='text'
          name=''
          id=''
          value={productInfo.title}
          onChange={onTitleChange}
        />
      </div>
      <div>
        <label htmlFor=''>price</label>
        <input
          type='number'
          name=''
          id=''
          value={productInfo.price}
          onChange={onPriceChange}
        />
      </div>
      <div>
        <button type='button' onClick={handleClick}>
          重置
        </button>
      </div>
    </form>
  )
}

export default EditProduct
