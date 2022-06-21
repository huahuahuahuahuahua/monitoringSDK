import getLastEvent from '../utils/getLastEvent'
import getSelector from '../utils/getSelector'
import tracker from '../utils/tracker'

export function injectJsError() {
    window.addEventListener('error', function (event) { // 错误事件对象
        console.log(event)
        let lastEvent = getLastEvent() // 获取最后一个交互事件
        console.log(lastEvent)
        if (event.target&&(event.target.src||event.target.href)) {
            let log = {
                kind: 'stability', // 监控指标的大类
                type: 'error', // 小类型 这是一个错误
                errorType: 'resourceError', // 资源加载错误
                url: '', // 报错时的访问路径
                // message: event.message, // 报错信息
                filename: event.target.src || event.target.href, // 报错的文件名
                tagName: event.target.tagName, // 报错的标签名
                selector: getSelector(event.target) // 代表最后一个操作的元素
            }
        }else{
            let log = {
                kind: 'stability', // 监控指标的大类
                type: 'error', // 小类型 这是一个错误
                errorType: 'jsError', // js 执行错误
                url: '', // 报错时的访问路径
                message: event.message, // 报错信息
                filename: event.filename, // 报错的文件名
                position: `${event.lineno}:${event.colno}`,
                stack: getLines(event.error.stack),
                selector: lastEvent ? getSelector(lastEvent.path) : ''// 代表最后一个操作的元素
            }

            console.log('js log', log)
            tracker.send(log)
        }
    },true)
    // 监听全局未捕获的 promise 错误
    window.addEventListener('unhandledrejection', function (event) { // promise 错误事件对象
        console.log(event)
        let lastEvent = getLastEvent() // 获取最后一个交互事件
        let message
        let filename
        let line = 0
        let column = 0
        let stack = ''
        let reason = event.reason
        if (typeof reason === 'string') {
            message = reason
        } else if (typeof reason === 'object') { // 说明是一个错误对象
            if (reason.stack) {
                let matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/)
                filename = matchResult[1]
                line = matchResult[2]
                column = matchResult[3]
            }
            message = reason.message
            stack = getLines(reason.stack)
        }

        let log = {
            kind: 'stability', // 监控指标的大类
            type: 'error', // 小类型 这是一个错误
            errorType: 'promiseError', // promise 执行错误
            url: '', // 报错时的访问路径
            message: message, // 报错信息
            filename: filename, // 报错的文件名
            position: `${line}:${column}`,
            stack: stack,
            selector: lastEvent ? getSelector(lastEvent.path) : ''// 代表最后一个操作的元素
        }

        console.log('promise log', log)
        tracker.send(log)
    }, true)

    function getLines(stack) {
        return stack.split('\n').slice(1).map(item => item.replace(/^\s+at\s+/g, '')).join('^')
    }
};

