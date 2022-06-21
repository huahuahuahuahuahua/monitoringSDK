import tracker from '../utils/tracker'
import onload from '../utils/onload'

export function blankScreen() {
  let wrapperElements = ['html', 'body', '#container', '.content']
  let emptyPoints = 0
  function getSelector(element) {
    if (element.id) {
      return `#${element.id}`
    } else if (element.className && typeof element.className === 'string') {
      return `.${element.className.split(' ').filter(item => !!item).join('.')}`
    } else {
      return element.nodeName.toLowerCase()
    }
  }
  function isWrapper(element) {
    let selector = getSelector(element)
    if (wrapperElements.indexOf(selector) !== -1) {
      emptyPoints++
    }
  }
  onload(function() {
    for (let i = 1; i <= 59; i++) {
      let xElements = document.elementsFromPoint( // 屏幕中心十字线横线上 59 个点
        window.innerWidth * i / 60,
        window.innerHeight / 2
      )
      let yElements = document.elementsFromPoint( // 屏幕中心十字线竖线上 59 个点
        window.innerWidth / 2,
        window.innerHeight * i / 60
      )
      isWrapper(xElements[0])
      isWrapper(yElements[0])
    }
    if (emptyPoints > 116) {
      let centerElement = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2)
      let log = {
        kind: 'stability',
        type: 'blank',
        emptyPoints,
        screen: window.screen.width + 'x' + window.screen.height,
        viewPoint: window.innerWidth + 'x' + window.innerHeight,
        selector: getSelector(centerElement[0])
      }
      tracker.send(log)
    }
  })
}
