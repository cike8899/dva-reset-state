import React from 'react'
import { Route, Switch, Router } from 'dva/router'
import { DvaInstance } from 'dva'
import * as H from 'history'

import Header from './Header'
import ProductList from './ProductList'
import EditProduct from './EditProduct'
import ProductCategory from './ProductCategory'

// import { ExampleComponent } from 'dva-reset-state'
// import 'dva-reset-state/dist/index.css'

// const { Route, Switch, Router } = router

interface IProps {
  history: H.History
  app?: DvaInstance
}

const App: React.FC<IProps> = ({ history }) => {
  // return <ExampleComponent text='Create React Library Example 😄' />

  return (
    <Router history={history}>
      <>
        <Header></Header>
        <Switch>
          <Route
            path='/productList'
            component={(...props: any) => (
              <ProductList {...props}></ProductList>
            )}
          />
          <Route path='/editProduct' component={EditProduct} />
          <Route path='/productCategory' component={ProductCategory} />
        </Switch>
      </>
    </Router>
  )
}

export default App
