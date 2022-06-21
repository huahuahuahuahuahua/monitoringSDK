import tracker from "../utils/tracker";
import onload from "../utils/onload";
import getLastEvent from "../utils/getLastEvent";
import getSelector from "../utils/getSelector";

export function timing() {
  let FP, FCP, FMP, LCP;
  if (PerformanceObserver) {
    // 增加性能条目的观察者
    new PerformanceObserver((entryList, observer) => {
      let perfEntries = entryList.getEntries();
      FMP = perfEntries[0];
      observer.disconnect(); // 停止观察
    }).observe({ entryTypes: ["element"] }); // 观察页面中有意义的元素

    new PerformanceObserver((entryList, observer) => {
      let perfEntries = entryList.getEntries();
      LCP = perfEntries[0];
      observer.disconnect(); // 停止观察
    }).observe({ entryTypes: ["largest-contentful-paint"] }); // 观察页面中最大内容绘制的元素

    new PerformanceObserver((entryList, observer) => {
      let firstInput = entryList.getEntries()[0];
      console.log("FID", firstInput);
      if (firstInput) {
        // processingStart 开始处理的时间 - startTime 开始点击、输入的时间，差值就是处理的延迟
        let inputDelay = firstInput.processingStart - firstInput.startTime;
        let duration = firstInput.duration; // 处理的耗时
        if (inputDelay > 0 || duration > 0) {
          // 说明有延迟，需要记录
          let lastEvent = getLastEvent();
          let inputDelayLog = {
            kind: "experience",
            type: "firstInputDelay", // 首次输入延迟
            inputDelay, // 延迟的时间
            duration, // 处理的时间
            startTime: firstInput.startTime,
            selector: lastEvent
              ? getSelector(lastEvent.path || lastEvent.target)
              : "",
          };
          tracker.send(inputDelayLog);
        }
      }
      observer.disconnect(); // 停止观察
    }).observe({ type: "first-input", buffered: true }); // 用户第一次交互，点击页面、输入内容
  }

  onload(function () {
    setTimeout(() => {
      // 发送各个阶段的时间数据
      const {
        fetchStart,
        connectStart,
        connectEnd,
        requestStart,
        responseStart,
        responseEnd,
        domLoading,
        domInteractive,
        domContentLoadedEventStart,
        domContentLoadedEventEnd,
        loadEventStart,
      } = performance.timing;
      let log = {
        kind: "experience", // 用户体验指标
        type: "timing", // 统计各个阶段的时间
        connectTime: connectEnd - connectStart, // 连接时间
        ttfbTime: responseStart - requestStart, // 首字节时间
        responseTime: responseEnd - responseStart, // 响应时间
        parseDOMTime: loadEventStart - domLoading, // DOM解析时间
        domContentLoadedTime:
          domContentLoadedEventEnd - domContentLoadedEventStart, // DOMContentLoaded事件时间
        timeToInteractive: domInteractive - fetchStart, // 可交互时间
        loadTime: loadEventStart - fetchStart, // 页面加载时间
      };
      tracker.send(log);

      // 发送性能数据
      FP = performance.getEntriesByName("first-paint")[0];
      FCP = performance.getEntriesByName("first-contentful-paint")[0];
      console.log("FP", FP);
      console.log("FCP", FCP);
      console.log("FMP", FMP);
      console.log("LCP", LCP);
      let paintLog = {
        kind: "experience",
        type: "paint",
        firstPaint: FP ? FP.startTime : 0,
        firstContentfulPaint: FCP ? FCP.startTime : 0,
        firstMeaningfulPaint: FMP ? FMP.startTime : 0,
        largestContentfulPaint: LCP ? LCP.startTime : 0,
      };
      tracker.send(paintLog);
    }, 3000);
  });
}
