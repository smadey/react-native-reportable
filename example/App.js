/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import {createStackNavigator, createAppContainer} from 'react-navigation'

import HomeScreen from './screens/HomeScreen'
import BasicScreen from './screens/BasicScreen'

const MainNavigator = createStackNavigator({
  Home: {screen: HomeScreen},
  Basic: {screen: BasicScreen},
})

const App = createAppContainer(MainNavigator)

export default App
