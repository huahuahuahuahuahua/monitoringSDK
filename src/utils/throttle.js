export function throttle(fn, delay) {
  let timer = null
  let startTime = Date.now()
  return function () {
      let curTime = Date.now() // 当前时间
      let remaining = delay - (curTime - startTime)  // 从上一次到现在，还剩下多少多余时间
      let context = this
      let args = arguments
      clearTimeout(timer)
      if (remaining <= 0) {
          fn.apply(context, args)
          startTime = Date.now()
      } else {
          timer = setTimeout(fn, remaining)
      }
  }
}
