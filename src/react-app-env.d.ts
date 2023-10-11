/// <reference types="react-scripts" />

// 使用dayjs代替moment
declare module 'moment' {
  import { Dayjs } from 'dayjs'
  namespace moment {
    type Moment = Dayjs
  }
  export = moment
  export as namespace moment
}

interface Window {
  collectEvent: Function
}
