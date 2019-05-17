/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react'
import {Button, StyleSheet, View} from 'react-native'
import {createStackNavigator, createAppContainer} from 'react-navigation'

import BasicScreen from './js/basic'

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Button title="basic" onPress={() => navigation.navigate('Basic')} />
    </View>
  )
}

const MainNavigator = createStackNavigator({
  Home: {screen: HomeScreen},
  Basic: {screen: BasicScreen},
})

const App = createAppContainer(MainNavigator)

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
})
