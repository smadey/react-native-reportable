import React from 'react'
import {Button, StyleSheet, View} from 'react-native'

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Button title="basic" onPress={() => navigation.navigate('Basic')} />
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
})
