
const flamer = (() => {
  const stack = [ ]
  const flameGraph = { }
  let _t = null
  function logEvent (now) {
    const elapsed = now - _t
    const text = stack.join(';')
    flameGraph[text] = (flameGraph[text] || 0) + elapsed
  }
  function start (name) {
    const now = performance.now()
    if (_t) {
      logEvent(now)
    }
    stack.push(name)
    _t = now
  }
  function finish () {
    const now = performance.now()
    logEvent(now)
    stack.pop()
    _t = stack.length ? now : null
  }
  function record (name, f) {
    try {
      start(name)
      return f()
    } finally {
      finish()
    }
  }
  function dump () {
    const out = [ ]
    for (const key of Object.keys(flameGraph)) {
      out.push(key + ' ' + flameGraph[key])
    }
    out.sort()
    return out.join('\n')
  }
  return { record, dump }
})()

window.flamer = flamer

rec.mountComponent = (orig => function (internalInstance) {
  const nextElement = internalInstance._currentElement
  const elementType = nextElement.type
  if (elementType && (typeof elementType === 'function')) {
    const name = elementType.name || (elementType.prototype && elementType.prototype.name)
    return flamer.record(name + '.mount', () => orig.apply(this, arguments))
  }
  return orig.apply(this, arguments)
})(rec.mountComponent)

rec.unmountComponent = (orig => function (internalInstance) {
  const nextElement = internalInstance._currentElement
  const elementType = nextElement.type
  if (elementType && (typeof elementType === 'function')) {
    const name = elementType.name || (elementType.prototype && elementType.prototype.name)
    return flamer.record(name + '.unmount', () => orig.apply(this, arguments))
  }
  return orig.apply(this, arguments)
})(rec.unmountComponent)

rec.receiveComponent = (orig => function (internalInstance, nextElement) {
  const elementType = nextElement.type
  if (elementType && (typeof elementType === 'function')) {
    const name = elementType.name || (elementType.prototype && elementType.prototype.name)
    return flamer.record(name + '.update', () => orig.apply(this, arguments))
  }
  return orig.apply(this, arguments)
})(rec.receiveComponent)
