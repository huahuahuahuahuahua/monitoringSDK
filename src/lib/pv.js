import tracker from '../utils/tracker'

/**
 * @description 上报 pv
 * @description 切换页面时，路由切换时进行上报
 * @description hash 路由，在 hashchange 事件进行上报
 * @description history 路由，在 popstate 事件进行上报，pushState 和 replaceState 不会触发事件，重写这两个方法进行上报
 */
export function injectPv() {
  function bindEvent(type, fn) {
    return function (...args) {
      const value = fn.apply(window.history, args)
      const e = new Event(type)
      window.dispatchEvent(e)
      return value
    }
  }

  // 重写 pushState 和 replaceState
  window.history.pushState = bindEvent('pushState', window.history.pushState)
  window.history.replaceState = bindEvent('replaceState', window.history.replaceState)

  // 对包括重写后的事件进行监听
  const PV_EVENTS = ['hashchange', 'popstate', 'pushState', 'replaceState']
  PV_EVENTS.forEach(event => {
    window.addEventListener(event, () => {
      const path = event === 'hashchange' ? location.hash.slice(1) : location.pathname
      tracker.send({
        kind: 'business',
        type: 'pv',
        path
      })
    })
  })
}
