import React from 'react'
import {
  InteractionManager,
  UIManager,
} from 'react-native'

const log = console.log.bind(console) // eslint-disable-line no-console
const merge = (obj1, obj2) => Object.assign({}, obj1, obj2)
const round = Math.round

let id = 0
class ReportableNode {
  constructor({ parent, isReporter }) {
    const node = this

    node.id = id++ // eslint-disable-line no-plusplus
    node.parent = parent
    node.children = []
    node.isReporter = !!isReporter

    if (parent) {
      parent.children.push(node)
    }
  }

  get(key) {
    const node = this
    const pkey = `_${key}`
    return node[pkey] || (node.parent && node.parent.get(key))
  }

  set(key, value) {
    const node = this
    const pkey = `_${key}`
    if (node[pkey] !== value) {
      if (value == null) {
        delete node[pkey]
      } else {
        node[pkey] = value
      }
    }
  }

  update({
    onReportVisible, onReportPress, onMergeData,
    reportWOffset, reportHOffset,
    reportItemKey,
    ...props
  }) {
    const node = this

    node.set('onReportVisible', onReportVisible)
    node.set('onReportPress', onReportPress)
    node.set('onMergeData', onMergeData)

    node.reportWOffset = reportWOffset || 0
    node.reportHOffset = reportHOffset || 0

    node.isItemReporter = reportItemKey != null
    node.reportItemKey = reportItemKey

    const data = {}
    Object.keys(props).forEach((name) => {
      if (name.indexOf('report-') === 0) {
        data[name.replace('report-', '')] = props[name]
        delete props[name]
      }
    })
    node.data = data

    return props
  }

  destroy() {
    const node = this
    const parent = node.parent
    if (parent) {
      const index = parent.children.indexOf(node)
      if (index > -1) {
        parent.children.splice(index, 1)
      }
    }
    node.children.forEach((child) => {
      child.destroy()
    })
  }

  get onReportVisible() {
    return this.get('onReportVisible') || log
  }

  get onReportPress() {
    return this.get('onReportPress') || log
  }

  get onMergeData() {
    return this.get('onMergeData') || merge
  }

  get mergedData() {
    const node = this
    return node.onMergeData((node.parent && node.parent.mergedData) || {}, node.data || {})
  }

  onLayout(event) {
    const node = this
    const target = event.target
    node.measuring = true // 测量中标记位，防止在判断子元素是否可见时被忽略
    InteractionManager.runAfterInteractions(() => {
      UIManager.measure(target, (x, y, w, h, pageX, pageY) => {
        let parent = node.parent
        let parentViewport
        while (parent) {
          if (parentViewport = parent.viewport) { // eslint-disable-line no-cond-assign
            pageX += parentViewport.dx || 0
            pageY += parentViewport.dy || 0
          }
          parent = parent.parent
        }

        const x0 = round(pageX)
        const y0 = round(pageY)
        node.measuring = false
        node.viewport = {
          dx: 0,
          dy: 0,
          ...node.viewport,
          x0,
          y0,
          x1: x0 + round(w) + node.reportWOffset,
          y1: y0 + round(h) + node.reportHOffset,
        }
        node.reportVisible()
      })
    })
  }

  onPress() {
    const node = this
    node.onReportPress(node.mergedData)
  }

  onScroll(event) {
    const node = this
    const { contentOffset = {}, layoutMeasurement = {} } = event.nativeEvent
    const viewport = node.viewport
    node.viewport = viewport && {
      ...viewport,
      x1: viewport.x0 + round(layoutMeasurement.width) + node.reportWOffset,
      y1: viewport.y0 + round(layoutMeasurement.height) + node.reportHOffset,
      dx: round(contentOffset.x),
      dy: round(contentOffset.y),
    }
    node.reportVisible()
  }

  onViewableItemsChanged(info) {
    const node = this

    if (info.viewableItems) {
      // FlatList format: { index, isViewable, item, key }
      // SectionList format: { index(header: null, item: 0+), isViewable, item, key, section }
      node.visibleChildren = info.viewableItems.map(d => d.key)
      node.reportVisible()
    }
  }

  isVisible() {
    const node = this
    const viewport = node.viewport
    if (!viewport) {
      return false
    }

    let parent = node.parent
    let parentViewport
    let { x0, y0, x1, y1, dx, dy } = viewport // eslint-disable-line object-curly-newline
    while (parent) {
      if (parent.measuring) {
        return false
      }
      if (parentViewport = parent.viewport) { // eslint-disable-line no-cond-assign
        dx += parentViewport.dx
        dy += parentViewport.dy
        x0 = Math.max(x0, parentViewport.x0 + dx)
        y0 = Math.max(y0, parentViewport.y0 + dy)
        x1 = Math.min(x1, parentViewport.x1 + dx)
        y1 = Math.min(y1, parentViewport.y1 + dy)
      }
      parent = parent.parent
    }

    return !(viewport.x0 > x1 || viewport.x1 < x0 || viewport.y0 > y1 || viewport.y1 < y0)
  }

  reportVisible(isVisible) {
    const node = this

    let cur = node
    while (cur) {
      if (cur.isHidden) return
      cur = cur.parent
    }

    if (node.isReporter) {
      if (!node.isVisited && (node.isItemReporter ? isVisible : node.isVisible())) {
        node.isVisited = true
        node.onReportVisible(node.mergedData)
      }
    }
    if (node.children.length) {
      const visibleChildren = node.visibleChildren || []
      let reportedChildren = {} // 防止 key 相同的子元素上报多次
      node.children.forEach((child) => {
        if (child.isItemReporter) {
          const reportItemKey = child.reportItemKey
          if (visibleChildren.indexOf(reportItemKey) > -1 && !reportedChildren[reportItemKey]) {
            reportedChildren[reportItemKey] = true
            child.reportVisible(true)
          }
        } else {
          child.reportVisible()
        }
      })
      reportedChildren = null
    }
  }

  clearVisited() {
    const node = this
    if (node.isVisited) {
      node.isVisited = false
    }
    node.children.forEach((child) => {
      child.clearVisited()
    })
  }

  show() {
    this.isHidden = false
    this.reportVisible()
  }

  hide() {
    this.isHidden = true
    this.clearVisited()
  }

  refresh() {
    this.clearVisited()
    this.reportVisible()
  }
}

const ReportableContext = React.createContext(null)

function useEvent(name, node, props) {
  const handler = props[name]
  return {
    ...props,
    [name]: React.useCallback((event) => {
      node[name] && node[name](event)
      return handler && handler(event)
    }, [handler]),
  }
}

function useEmpty(node, props) {
  return props
}

export default function createReportableComponent(Component, {
  isReporter,

  isLayoutable,
  isPressable,
  isScrollable,
  isListable,

  useHooks,
} = {}) {
  if (isPressable) {
    isReporter = true
  }

  const useLayout = isLayoutable || isScrollable
    ? useEvent.bind(null, 'onLayout')
    : useEmpty

  const usePress = isPressable
    ? useEvent.bind(null, 'onPress')
    : useEmpty

  const useScroll = isScrollable
    ? useEvent.bind(null, 'onScroll')
    : useEmpty

  const useViewableItemsChanged = isListable
    ? useEvent.bind(null, 'onViewableItemsChanged')
    : useEmpty

  if (!useHooks) {
    useHooks = useEmpty
  }

  function ReportableComponent({ reportableRef, ...props }, forwardedRef) {
    const parent = React.useContext(ReportableContext)
    const node = React.useMemo(() => new ReportableNode({ parent, isReporter }), [])
    props = node.update(props)

    props = useLayout(node, props)
    props = usePress(node, props)
    props = useScroll(node, props)
    props = useViewableItemsChanged(node, props)

    props = useHooks(node, props)

    if (reportableRef) {
      if (typeof reportableRef === 'function') {
        reportableRef(node)
      } else {
        reportableRef.current = node
      }
    }
    React.useEffect(() => () => {
      if (reportableRef) {
        if (typeof reportableRef === 'function') {
          reportableRef(null)
        } else {
          reportableRef.current = null
        }
      }
      node.destroy()
    }, [])

    return (
      <ReportableContext.Provider value={node}>
        {
          Component
            ? <Component ref={forwardedRef} {...props} />
            : props.children
        }
      </ReportableContext.Provider>
    )
  }
  ReportableComponent = React.forwardRef(ReportableComponent)

  const displayName = Component && (Component.displayName || Component.name)
  ReportableComponent.displayName = displayName ? `Reportable(${displayName})` : 'Reportable'

  if (isScrollable) {
    ReportableComponent.defaultProps = {
      scrollEventThrottle: 16,
    }
  }
  return ReportableComponent
}
