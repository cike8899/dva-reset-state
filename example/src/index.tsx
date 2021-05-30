import './index.css'

import dva from 'dva_2.6.0-beta.20'
import { createBrowserHistory } from 'history'
import createResetState from 'dva-reset-state'
import App from './App'

import editProduct from './models/editProduct'
import productList from './models/productList'
import productCategory from './models/productCategory'

const history = createBrowserHistory({
  basename: ''
})

const app = dva({
  history
})

app.model(editProduct)
app.model(productList)
app.model(productCategory)

app.use(createResetState())

app.router(App as any)
app.start('#root')

export default app
