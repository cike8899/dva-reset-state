# dva-reset-state

> dva reset state plugin , 页面离开清理 dva 或 redux 中相关数据

[![NPM](https://img.shields.io/npm/v/dva-reset-state.svg)](https://www.npmjs.com/package/dva-reset-state) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```
npm install --save dva-reset-state
```

## Usage

- 注册 src/index.tsx

```tsx
import React, { Component } from 'react'

import createResetState from 'dva-reset-state'

const app: any = dva()
app.use(createResetState())
```

- 在 umi@3 中使用

app.ts

```
import { plugin } from 'umi';

import createResetState from 'dva-reset-state';

// 注册插件
plugin.register({
  apply: {
    dva: {
      plugins: [createResetState()],
    },
  },
  path: 'any', // 随意填写个字符串，否则报错
});
```

- 在需要重置状态的组件中使用

1. class 组件

```
import { resetState } from "dva-reset-state";

@connect() // connect必须写在resetState上面
@resetState("product")
export default class SQLManage extends Component<any> {
  render(){
    return <div>uuu</div>
  }
}
```

2. 函数组件

```
import React from "react";
import { connect } from "dva";
import { Dispatch } from "redux";
import { useResetState } from "dva-reset-state";
const EditProduct = ({ dispatch }: { dispatch: Dispatch<any> }) => {
  useResetState(dispatch, { editProduct: "productInfo" });
  return <div>ooo</div>;
};

export default connect()(EditProduct);
```

3. 在任何事件或者函数中使用

```
import React from "react";
import { connect } from "dva";
import { Dispatch } from "redux";
import { reset } from "dva-reset-state";

const Demo = ({ dispatch }: { dispatch: Dispatch<any> }) => {
  const onClick = () => {
    reset(dispatch, ["userList", { productList: ["list", "pageInfo"] }]);
  };
  return (
    <div>
      <button onClick={onClick}></button>
    </div>
  );
};

export default connect()(Demo);
```

## 重置哪些数据？

1. 重置所有 state,不传递参数

```
@resetState()

useResetState(dispatch);
```

2. 重置单个 namespace 数据

```
@resetState("editProduct")

useResetState(dispatch,"editProduct");
```

3. 重置多个 namespace 下的所有数据

```
@resetState(["productList","editProduct"])

useResetState(dispatch,["productList","editProduct"]);
```

4. 重置单个 namespace 下的单个数据

```
@resetState({productList:"list"})

useResetState(dispatch,{productList:"list"});
```

5. 重置单个 namespace 下的多个数据

```
@resetState({productList:["list","total"]})

useResetState(dispatch,{productList:["list","total"]});
```

6. 重置多个 namespace 下的多个数据

```
@resetState({productList:["list","total"],editProduct:"productInfo"})

useResetState(dispatch,{productList:["list","total"],editProduct:"productInfo"});
```

7. 重置某些 namespace 下所有字段或者重置某些 namespace 下部分字段

```
@resetState(['userList', { productList: ['list', 'pageInfo'] }])

useResetState(dispatch,['userList', { productList: ['list', 'pageInfo'] }]);
```

8. 重置给定 namespace 以外的 state

   第三个参数需要设置为 true

```
@resetState(['userList', { productList: ['list', 'pageInfo'] }], true)

useResetState(dispatch,['userList', { productList: ['list', 'pageInfo'] }], true);

reset(store.dispatch,'userList',true)
reset(store.dispatch,['userList','editProduct'],true)

reset(
  store.dispatch,
  ['userList', { editProduct: ['productInfo'] }]
  true
)


```

## License

MIT © [balibabu](https://github.com/cike8899)
