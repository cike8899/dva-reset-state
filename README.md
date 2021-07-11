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
import { resetStateWillOnmount } from "dva-reset-state";

@connect() // connect必须写在resetState上面
@resetStateWillOnmount("product")
export default class SQLManage extends Component<any> {
  render(){
    return <div>uuu</div>
  }
}
```

2. 函数组件

```
import React from "react";
import { useResetStateWillUnmount } from "dva-reset-state";

const EditProduct = () => {
  useResetStateWillUnmount({ editProduct: "productInfo" });
  return <div>ooo</div>;
};

export default EditProduct;
```

3. 在任何事件或函数中使用

* 函数组件

```
import React from "react";
import { useResetStateWillUnmount } from "dva-reset-state";

const Demo = () => {
  const resetState = useResetStateWillUnmount()

  const onClick = () => {
    resetState(["userList", { productList: ["list", "pageInfo"] }]);
  };
  return (
    <div>
      <button onClick={onClick}></button>
    </div>
  );
};

export default Demo;
```
* class 组件
```
import React from "react";
import { connect } from "dva";
import { reset } from "dva-reset-state";

@connect()
export default class Demo extends React.Component<any>{
     onClick = () => {
        reset(this.props.dispatch,["userList", { productList: ["list", "pageInfo"] }]);
      };
    render(){
        return (
            <div>
              <button onClick={this.onClick}></button>
            </div>
          );
    }
}

```

## 重置哪些数据？

1. 重置所有 state,不传递参数

```
@resetStateWillOnmount()

useResetStateWillUnmount();
```

2. 重置单个 namespace 数据

```
@resetStateWillOnmount("editProduct")

useResetStateWillUnmount("editProduct");
```

3. 重置多个 namespace 下的所有数据

```
@resetStateWillOnmount(["productList","editProduct"])

useResetStateWillUnmount(["productList","editProduct"]);
```

4. 重置单个 namespace 下的单个数据

```
@resetStateWillOnmount({productList:"list"})

useResetStateWillUnmount({productList:"list"});
```

5. 重置单个 namespace 下的多个数据

```
@resetStateWillOnmount({productList:["list","total"]})

useResetStateWillUnmount({productList:["list","total"]});
```

6. 重置多个 namespace 下的多个数据

```
@resetStateWillOnmount({productList:["list","total"],editProduct:"productInfo"})

useResetStateWillUnmount({productList:["list","total"],editProduct:"productInfo"});
```

7. 重置某些 namespace 下所有字段或者重置某些 namespace 下部分字段

```
@resetStateWillOnmount(['userList', { productList: ['list', 'pageInfo'] }])

useResetStateWillUnmount(['userList', { productList: ['list', 'pageInfo'] }]);
```

8. 重置给定 namespace 以外的 state

   第三个参数需要设置为 true

```
@resetStateWillOnmount(['userList', { productList: ['list', 'pageInfo'] }], true)

useResetStateWillUnmount(['userList', { productList: ['list', 'pageInfo'] }], true);

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
