import { throttle } from './throttle'

let host = 'cn-shanghai.log.aliyuncs.com'
let project = 'czwmonitor'
let logStore = 'czwmonitor-store'
let userAgent = require('user-agent')
let qs = require('qs')

function getExtraData() {
  return {
    title: document.title,
    url: location.href,
    timestamp: Date.now(),
    userAgent: userAgent.parse(navigator.userAgent).name,
    // 用户ID
  }
}

const queue = []
function doLowProMissions (IdleDeadline) {
  while (IdleDeadline.timeRemaining() && queue.length) {
    let url = queue.shift()
    console.log('url', url)
    let img = new Image()
    img.setAttribute('crossOrigin', 'anonymous')
    img.src = url
  }
  if (queue.length) {
    requestIdleCallback(doLowProMissions)
  }
}

class SendTracker {
  constructor() {
    this.url = `/api/logstores/${logStore}/track` // 上报路径
    this.xhr = new XMLHttpRequest()
    this.queue = []
  }
  idle(IdleDeadline) {
    while (IdleDeadline.timeRemaining() > 0 && this.queue.length > 0) {
      let url = this.queue.shift()
      let img = new Image()
      img.setAttribute('crossOrigin', 'anonymous')
      img.src = url
    }
    if (this.queue.length > 0) {
      requestIdleCallback(this.idle.bind(this, requestIdleCallback.IdleDeadline))
    }
  }
  send(data = {}) {
    let extraData = getExtraData()
    let log = {...extraData, ...data}
    // 对象的值不能是数字
    for (let key in log) {
      if (typeof log[key] === 'number') {
        log[key] = `${log[key]}`
      }
    }
    console.log('log', log)

    // let body = JSON.stringify({
    //   __logs__: [log]
    // })

    // this.xhr.open('POST', this.url, true)
    // this.xhr.setRequestHeader('x-log-apiversion', '0.6.0') // 版本号
    // this.xhr.setRequestHeader('x-log-bodyrawsize', body.length) // 请求体的大小
    // this.xhr.setRequestHeader('Content-Type', 'application/json') // 请求体类型
    // // this.xhr.setRequestHeader('x-log-compresstype', 'deflate')
    // this.xhr.onload = function () {
    //   // console.log(this.xhr.response)
    // }
    // this.xhr.onerror = function (error) {
    //   // console.log(error)
    // }

    // this.xhr.send(body)

    log.APIVersion = '0.6.0'
    let url = `http://${project}.${host}/logstores/${logStore}/track_us.gif?${qs.stringify(log)}`
    let report = throttle(() => {
      console.log('report url', url)
      queue.push(url)
    }, 2000)

    report()
    requestIdleCallback(doLowProMissions)
  }
}

export default new SendTracker()
