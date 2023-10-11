import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)
export function transformSeconds(seconds: number, unit?: 'seconds' | 'minute') {
  //超过24小时的情况暂时不判断
  const d = dayjs.duration(seconds, 'seconds')
  const h = parseTime(d.hours())
  const m = parseTime(d.minutes())
  const s = parseTime(d.seconds())
  if (unit == 'seconds') {
    return `${h}:${m}:${s}`
  }

  return `${m}:${s}`
}

function parseTime(time: number) {
  if (time < 10) {
    return '0' + time
  }

  return '' + time
}
