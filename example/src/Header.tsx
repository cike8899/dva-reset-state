import React from 'react'
import { Link } from 'dva/router'

const Header = () => {
  return (
    <ul>
      <li>
        <Link to='/productList'>product list</Link>
      </li>
      <li>
        <Link to='/editProduct'>edit product</Link>
      </li>
    </ul>
  )
}

export default Header
