import { observable, makeObservable, onBecomeUnobserved, action, getObserverTree, AnnotationMapEntry } from 'mobx'
import mitt from 'mitt'

export type Events = {
  navigate: { path?: string | null; replace?: boolean }
  matlArticlesArrived: { index: number }
  matlUploadedImgsArrived: undefined
}
export const emitter = mitt<Events>()

export class State<Data> {
  value?: Data
  readonly init: () => Data
  constructor(init: () => Data, { cacheTime = 1, annotation = observable }: { cacheTime?: number; annotation?: AnnotationMapEntry } = {}) {
    // 为了避免热更新时部分组件消失，cacheTime默认为1
    this.value = undefined
    this.init = init
    makeObservable(this, {
      value: annotation,
      init: false,
      use: false,
      get: false,
      set: action
    })
    if (cacheTime !== Infinity) {
      let timeoutId: number
      // 没有组件引用时自动清除数据使其能够被GC
      onBecomeUnobserved(this, 'value', () => {
        const handler = () => {
          if (!getObserverTree(this, 'value').observers?.length) {
            action('clean', () => {
              this.value = undefined
            })()
          }
        }
        if (cacheTime > 0) {
          clearTimeout(timeoutId)
          timeoutId = window.setTimeout(handler, cacheTime)
        } else {
          handler()
        }
      })
    }
  }
  use() {
    if (this.value === undefined) {
      action('init', () => {
        this.value = this.init()
      })()
    }
    return this.value as Data
  }
  get() {
    return this.value
  }
  set(data: Data) {
    this.value = data
  }
}

// 防止mobx报错：[mobx] Out of bounds read
export function valueAtIndex<Item>(list: Item[] | null | undefined, index: number) {
  return list && index < list.length ? list[index] : undefined
}
