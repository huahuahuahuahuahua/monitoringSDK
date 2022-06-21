import tracker from '../utils/tracker'

export function injectXHR() {
  let XMLHttpRequest = window.XMLHttpRequest
  let oldOpen = XMLHttpRequest.prototype.open
  XMLHttpRequest.prototype.open = function (method, url, async) {
    if (!url.match(/logstores/) && !url.match(/sockjs/)) {
      this.logData = { method, url, async }
    }
    return oldOpen.apply(this, arguments)
  }
    let oldSend = XMLHttpRequest.prototype.send
    let startTime
  XMLHttpRequest.prototype.send = function (body) {
    if (this.logData) {
      startTime = Date.now() // 请求开始时间
      let handler = (type) => (event) => {
        let duration = Date.now() - startTime // 请求持续时间
        let status = this.statusText // 2xx-4xx-5xx
        let statusText = this.statusText // 请求状态 OK Server Error
        let log = {
          kind: 'stability', // 监控指标的大类
          type: 'xhr', // 小类型 这是一个接口请求错误
          eventType: type, // load error abort
          pathname: this.logData.url, // 请求路径
          status: status + '-' + statusText, // 状态码 + 状态码描述
          response: this.response ?  JSON.stringify(this.response) : '', // 响应内容
          params: body || '' // 请求参数
        }
        // 上报
        tracker.send(log)
      }
      this.addEventListener('load', handler('load'), false)
      this.addEventListener('error', handler('error'), false)
      this.addEventListener('abort', handler('abort'), false)
    }
    return oldSend.apply(this, arguments)
  }
}
