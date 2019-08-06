# react-native-reportable
Easy to use declarative report for React Native

## Installation
`$ npm install --save react-native-reportable`

## Usage
To report things you must use the `createReportableComponent` or `Reportable.create` composer. The common components `View` (includes `Container` & `Visible`), `ScrollView`, `FlatList`, `SectionList`, `Text` and `Touchables` are precomposed and exposed under the `Reportable` namespace. If you have your own component that you wish to report, simply wrap it with a `Reportable.View` or compose it with:

```js
import Reportable from 'react-native-reportable';
MyCustomComponent = Reportable.create(MyCustomComponent);
```

### Declarative Usage
#### Report Visible
```html
<Reportable.View.Visible style={{height: 100}} report-foo="bar" />
```

#### Report Press
```html
<Reportable.Button title="press me" report-foo="bar" />
```

#### Properties
*Note: Other properties will be passed down to underlying component.*

| Prop | Description | Default |
|---|---|---|
|**`onReportVisible`**|A function that is called when Component is visible. The function is called with a `mergedData` argument. |`console.log`|
|**`onReportPress`**|A function that is called when Component has been pressed. The function is called with a `mergedData` argument. |`console.log`|
|**`onMergeData`**|A function that get the `mergedData`, the first argument is parent's `mergedData`, and the second argument is Component's data obtained by props with a `report-` prefix . |`Object.assign`|
|**`reportWOffset`**|The width offset of reportable node. |`0`|
|**`reportHOffset`**|The width offset of reportable node. |`0`|
|**`reportItemKey`**|The key of reportable list's reportable item. ||
|**`report-*`**|The report data prop. ||

### Imperative Usage
#### Refreshable FlatList
```js
import Reportable from 'react-native-animatable';

const RefreshableFlatList = Reportable.create(FlatList, {
  isListable: true,
  useHooks(node, props) {
    const onRefresh = props.onRefresh
    props.onRefresh = React.useCallback(() => {
      node.refresh()
      return onRefresh && onRefresh()
    }, [onRefresh])
    return props
  },
}),
```
