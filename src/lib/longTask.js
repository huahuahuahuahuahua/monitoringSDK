import tracker from '../utils/tracker'
import getLastEvent from '../utils/getLastEvent'
import getSelector from '../utils/getSelector'

export function longTask() {
  if (PerformanceObserver) {
    new PerformanceObserver((entryList) => {
      let perfEntries = entryList.getEntries()
      perfEntries.forEach((entry) => {
        if (entry.duration > 100) {
          let lastEvent = getLastEvent()
          // console.log('lastEvent', lastEvent)
          let selector = lastEvent
            ? getSelector(lastEvent.path || lastEvent.target)
            : ''
          requestIdleCallback(() => {
            tracker.send({
              kind: 'experience',
              type: 'longTask',
              eventType: lastEvent ? lastEvent.type : '',
              duration: entry.duration,
              startTime: entry.startTime,
              selector,
            })
          })
        }
      })
    }).observe({ entryTypes: ['longtask'] })
  }
}
