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

const Reportable = createReportableComponent()

const touchableOptions = { isPressable: true }

Object.assign(Reportable, {
  create: createReportableComponent,

  Container: createReportableComponent(View, { isLayoutable: true }),
  Reporter: createReportableComponent(View, { isReporter: true, isLayoutable: true }),
  TouchableReporter: createReportableComponent(TouchableHighlight, {
    isReporter: true,
    isLayoutable: true,
    isPressable: true,
  }),

  ScrollView: createReportableComponent(ScrollView, { isScrollable: true }),

  FlatList: createReportableComponent(FlatList, { isListable: true }),
  SectionList: createReportableComponent(SectionList, { isListable: true }),

  Button: createReportableComponent(Button, touchableOptions),
  Text: createReportableComponent(Text, touchableOptions),
  TouchableHighlight: createReportableComponent(TouchableHighlight, touchableOptions),
  TouchableNativeFeedback: createReportableComponent(TouchableNativeFeedback, touchableOptions),
  TouchableOpacity: createReportableComponent(TouchableOpacity, touchableOptions),
  TouchableWithoutFeedback: createReportableComponent(TouchableWithoutFeedback, touchableOptions),

  View: createReportableComponent(View),
})

export default Reportable

export {
  createReportableComponent,
}
