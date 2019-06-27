import React from 'react'
import {
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import Reportable from '../..'

const onReportVisible = (data) => {
  console.warn(JSON.stringify(data))
}

const onReportPress = (data) => {
  console.warn(JSON.stringify(data))
}

const onMergeReportData = (data1, data2) => {
  const data = { ...data1, ...data2 }
  data.id = [data1.id, data2.id].filter(Boolean).join('_')
  return data
}

function BasicScreen() {
  const [refreshing, setRefreshing] = React.useState(false)

  const ref = React.useRef()

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      ref.current && ref.current.refresh()
    }, 1000)
  }, [])

  return (
    <Reportable.ScrollView
      style={styles.container}
      reportableRef={ref}
      onReportVisible={onReportVisible}
      onReportPress={onReportPress}
      onMergeData={onMergeReportData}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      reportHOffset={-100}
      report-id="basic"
    >
      <Reportable.View.Visible report-id="r1">
        <Reportable.TouchableHighlight.Visible report-id="v1" report-v="1">
          <View style={styles.v1}>
            <Text style={styles.txt}>500</Text>
          </View>
        </Reportable.TouchableHighlight.Visible>
        <Reportable.View.Visible report-id="r2">
          <Reportable.TouchableHighlight.Visible report-id="v2" report-v="2">
            <View style={styles.v2}>
              <Text style={styles.txt}>350</Text>
            </View>
          </Reportable.TouchableHighlight.Visible>
        </Reportable.View.Visible>
        <Reportable.TouchableHighlight.Visible report-id="v3" report-v="3">
          <View style={styles.v3}>
            <Text style={styles.txt}>200</Text>
          </View>
        </Reportable.TouchableHighlight.Visible>
      </Reportable.View.Visible>
      <Reportable.ScrollView report-id="s2" reportWOffset={-30} horizontal={true} showsHorizontalScrollIndicator={false} style={styles.ff}>
        <Reportable.TouchableHighlight.Visible report-id="h1" report-h="1">
          <View style={styles.h1}>
            <Text style={styles.txt}>300x100</Text>
          </View>
        </Reportable.TouchableHighlight.Visible>
        <Reportable.TouchableHighlight.Visible report-id="h2" report-h="2">
          <View style={styles.h2}>
            <Text style={styles.txt}>200x100</Text>
          </View>
        </Reportable.TouchableHighlight.Visible>
        <Reportable.TouchableHighlight.Visible report-id="h3" report-h="3">
          <View style={styles.h3}>
            <Text style={styles.txt}>100x100</Text>
          </View>
        </Reportable.TouchableHighlight.Visible>
      </Reportable.ScrollView>
    </Reportable.ScrollView>
  )
}

BasicScreen.navigationOptions = {
  title: 'Basic Demo',
}

export default BasicScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  v1: {
    backgroundColor: '#f00',
    height: 500,
  },
  v2: {
    backgroundColor: '#0f0',
    height: 350,
  },
  v3: {
    backgroundColor: '#00f',
    height: 200,
  },

  h1: {
    backgroundColor: '#f00',
    height: 100,
    width: 300,
  },
  h2: {
    backgroundColor: '#0f0',
    height: 100,
    width: 200,
  },
  h3: {
    backgroundColor: '#00f',
    height: 100,
    width: 100,
  },

  txt: {
    alignSelf: 'center',
    color:'#000',
    fontSize: 20,
    textAlign: 'center',
  },
})
