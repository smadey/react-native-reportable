import {
  Button,
  FlatList,
  SectionList,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import createReportableComponent from './createReportableComponent'

const define = (Owner, name, ...args) => {
  let ReportableComponent

  const names = name.split('.')
  if (names.length > 1) {
    name = names.pop()
    Owner = names.reduce((obj, n) => obj[n] || (obj[n] = {}), Owner)
  }

  Object.defineProperty(Owner, name, {
    configurable: true,
    get() {
      return ReportableComponent || (ReportableComponent = create(...args)) // eslint-disable-line no-use-before-define
    },
  })
}

const create = (Component, options, children) => {
  const ReportableComponent = createReportableComponent(Component, options || {})
  if (children) {
    Object.keys(children).forEach((name) => {
      define(ReportableComponent, name, Component, { ...options, ...children[name] })
    })
  }
  return ReportableComponent
}

const Reportable = create()
const mount = define.bind(null, Reportable)
Reportable.create = create
Reportable.mount = mount

mount('View', View, null, {
  Container: { isLayoutable: true },
  Visible: { isReporter: true, isLayoutable: true },
  Reporter: { isReporter: true, isLayoutable: true },
})

mount('Text', Text, null, {
  Visible: { isLayoutable: true, isPressable: true },
  Pressable: { isLayoutable: true, isPressable: true },
  Reporter: { isReporter: true, isLayoutable: true },
})

const scrollable = { isScrollable: true }
mount('ScrollView', ScrollView, scrollable)

const listableOptions = { isListable: true }
mount('FlatList', FlatList, listableOptions)
mount('SectionList', SectionList, listableOptions)

const touchableOptions = { isPressable: true }
const touchableChildren = {
  Visible: { isLayoutable: true },
}
mount('Button', Button, touchableOptions, touchableChildren)
mount('TouchableHighlight', TouchableHighlight, touchableOptions, touchableChildren)
mount('TouchableNativeFeedback', TouchableNativeFeedback, touchableOptions, touchableChildren)
mount('TouchableOpacity', TouchableOpacity, touchableOptions, touchableChildren)
mount('TouchableWithoutFeedback', TouchableWithoutFeedback, touchableOptions, touchableChildren)

export default Reportable

export {
  create as createReportableComponent,
  mount as mountReportableComponent,
}
