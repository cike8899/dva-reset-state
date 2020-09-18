import React from 'react'
import { connect, DispatchProp } from 'dva_2.6.0-beta.20'
import { compose } from 'redux'
import { resetState } from 'dva-reset-state'

interface IProps {
  list: any[]
}

// 使用装饰器也可以，resetState需要放在connect下面

// @connect((props: any) => ({ list: props.productList.list })),
// @resetState('productList')
class ProductList extends React.Component<IProps & DispatchProp> {
  getData = () => {
    this.props.dispatch({
      type: 'productList/setProductList',
      payload: [
        { title: '桌子', price: 100 },
        { title: '笔记本', price: 9 }
      ]
    })
  }
  render() {
    const { list } = this.props
    return (
      <div>
        <ul>
          {list.map((x, idx) => (
            <li key={idx}>
              <label htmlFor=''>{x.title}</label> 价格：<span>{x.price}</span>
            </li>
          ))}
        </ul>
        <button type='button' onClick={this.getData}>
          获取数据
        </button>
      </div>
    )
  }
}

export default compose<React.ComponentClass>(
  connect((props: any) => ({ list: props.productList.list })),
  resetState('productList')
)(ProductList)
