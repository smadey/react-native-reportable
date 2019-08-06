import React from 'react'
import {
  UIManager,
} from 'react-native'

const log = console.log.bind(console) // eslint-disable-line no-console
const merge = (obj1, obj2) => Object.assign({}, obj1, obj2)
const round = num => Math.round(num) || 0

let id = 0
class ReportableNode {
  constructor({ parent, isReporter, isContainer }) {
    const node = this

    node.id = id++ // eslint-disable-line no-plusplus
    node.parent = parent
    node.children = []
    node.isReporter = !!isReporter
    node.isContainer = !!isContainer

    if (parent) {
      parent.children.push(node)
    }
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
    node.isDestroyed = true
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

  get onReportVisible() {
    return this.get('onReportVisible') || log
  }

  set onReportVisible(value) {
    this.set('onReportVisible', value)
  }

  get onReportPress() {
    return this.get('onReportPress') || log
  }

  set onReportPress(value) {
    this.set('onReportPress', value)
  }

  get onMergeData() {
    return this.get('onMergeData') || merge
  }

  set onMergeData(value) {
    this.set('onMergeData', value)
  }

  get mergedData() {
    const node = this
    return node.onMergeData((node.parent && node.parent.mergedData) || {}, node.data || {})
  }

  update({
    onReportVisible, onReportPress, onMergeData,
    reportWOffset, reportHOffset,
    reportItemKey,
    ...props
  }) {
    const node = this

    node.onReportVisible = onReportVisible
    node.onReportPress = onReportPress
    node.onMergeData = onMergeData

    node.reportWOffset = round(reportWOffset)
    node.reportHOffset = round(reportHOffset)

    node.isItemReporter = reportItemKey != null
    node.reportItemKey = reportItemKey

    const data = {}
    Object.keys(props).forEach((name) => {
      if (name.indexOf('report-') === 0) {
        if (props[name] != null) {
          data[name.replace('report-', '')] = props[name]
        }
        delete props[name]
      }
    })
    node.data = data

    return props
  }

  measure() {
    const node = this
    if (!node.reactTag) return

    /* eslint-disable no-multi-assign */
    UIManager.measure(node.reactTag, (x, y, w, h, pageX, pageY) => {
      if (node.isDestroyed) return

      // Check if clipped by parent removeClippedSubviews prop
      const isClipped = node.isClipped = w == null && h == null && pageX == null && pageY == null
      if (isClipped) return

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

      const prevViewport = node.viewport || {}
      const nextViewport = node.viewport = {
        dx: 0,
        dy: 0,
        ...prevViewport,
        x0,
        y0,
        x1: x0 + round(w) + node.reportWOffset,
        y1: y0 + round(h) + node.reportHOffset,
      }

      if (prevViewport.x0 === nextViewport.x0 && prevViewport.y0 === nextViewport.y0) {
        node.reportVisible()
      } else {
        setTimeout(() => {
          !node.isDestroyed && node.measure()
        }, 500)
      }
    })
  }

  onLayout(event) {
    const node = this
    node.reactTag = event.target
    node.measure()
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
      if (parent.isContainer) {
        parentViewport = parent.viewport
        if (!parentViewport) return false

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

  reportVisible(isItemVisible) {
    const node = this

    let cur = node
    while (cur) {
      if (cur.isHidden) return
      cur = cur.parent
    }

    if (node.isClipped) {
      node.measure()
      return
    }

    if (!node.isVisited) {
      const isVisibleReporter = node.isItemReporter ? isItemVisible : (node.isReporter && node.isVisible())
      if (isVisibleReporter) {
        node.isVisited = true
        node.onReportVisible(node.mergedData)
      }
    }
    if (node.children.length) {
      const isInvisibleContainer = node.isContainer && !(node.isItemReporter ? isItemVisible : node.isVisible())
      if (!isInvisibleContainer) {
        const visibleChildren = node.visibleChildren || []
        node.children.forEach((child) => {
          if (child.isItemReporter) {
            if (visibleChildren.indexOf(child.reportItemKey) > -1) {
              child.reportVisible(true)
            }
          } else {
            child.reportVisible()
          }
        })
      }
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
  if (isReporter || isScrollable) {
    isLayoutable = true
  }

  const isContainer = isLayoutable

  const useLayout = isLayoutable
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
    const node = React.useMemo(() => new ReportableNode({ parent, isReporter, isContainer }), [])
    props = node.update(props)

    props = useLayout(node, props)
    props = usePress(node, props)
    props = useScroll(node, props)
    props = useViewableItemsChanged(node, props)

    props = useHooks(node, props)

    React.useEffect(() => {
      if (reportableRef) {
        if (typeof reportableRef === 'function') {
          reportableRef(node)
        } else {
          reportableRef.current = node
        }
      }
      return () => {
        if (reportableRef) {
          if (typeof reportableRef === 'function') {
            reportableRef(null)
          } else {
            reportableRef.current = null
          }
        }
        node.destroy()
      }
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
