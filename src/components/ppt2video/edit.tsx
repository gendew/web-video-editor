import { MouseEventHandler, useEffect, useRef, useState } from 'react'
import { CaretDownOutlined, CloudUploadOutlined, CustomerServiceOutlined, MinusSquareOutlined, PlayCircleOutlined, PlusSquareOutlined, SoundOutlined } from '@ant-design/icons'
import { MakeStore, AxisImgType, AudioDrawerVisible, AxisAudiosType, AxisAvatarsType, useAIAudioTTS, currentAudioInfo, AvatarDrawerVisible, useAIAvatar, AxisAvatarsResType, ExportModalVisible, successVisible } from '@/store/ppt2video/edit'
import { transformSeconds } from '@/utils'
import { action, runInAction } from 'mobx'
import { DndContext, DragEndEvent, MouseSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import clsx from 'clsx'
import { Resizable, ResizableBox } from 'react-resizable'
import { Button, Drawer, Input, Modal, Slider, Tooltip, message } from 'antd'
import { observer } from 'mobx-react-lite'
import { useNavigate, useParams } from 'react-router-dom'
import closeDrawer from '@/assets/close-drawer.png'
import FEMALEPNG from '@/assets/female.png'
import MALEPNG from '@/assets/male.png'
import PLAYINGPNG from '@/assets/playing.png'
const { TextArea } = Input

export const PPTToVideoEdit = observer(function VideoPubView() {
  const id = useParams().id || ''
  const { getProjectInfo } = MakeStore
  useEffect(() => {
    document.title = 'PPT转视频-PPT转视频'
    getProjectInfo(id)
  }, [])

  return (
    <div className="h-full overflow-auto flex bg-[#f5f5f5] custom">
      <SuperMake />
      <AudioDrawer />
      <AvatarDrawer />
      <ExportModal />
      <SuccessModal />
    </div>
  )
})

const sensorOptions = { activationConstraint: { distance: 4 } }

const MakeHeader = observer(function () {
  const { totalTime, title, id, digitalInfo, audioInfo, pptInfo, metaId, folder } = MakeStore

  const mutation = () => {
    const params = {
      id,
      content: {
        meta: {
          id: metaId,
          title,
          folder
        },
        timeline: {
          images: pptInfo,
          audios: audioInfo,
          avatars: digitalInfo,
          captions: ''
        }
      }
    }
    console.log(params)
    message.success('保存成功')
  }

  return (
    <div className="h-10 bg-white flex items-center justify-between shadow">
      <div className="flex items-center">
        <div className="text-[#333] font-semibold px-[30px]">{title}</div>
        <Tooltip title="保存">
          <Button onClick={() => mutation} className="ml-10" type="default" shape="round" icon={<CloudUploadOutlined className="text-[#00C033] text-[20px]" />}>
            {transformSeconds(totalTime, 'seconds')}
          </Button>
        </Tooltip>
      </div>
      <div className="pr-[50px]">
        <Button type="primary" onClick={() => ExportModalVisible.set(true)}>
          导出
        </Button>
      </div>
    </div>
  )
})

const SuperMake = observer(function () {
  const { unit, totalWidth, playTime, totalTime, gap, pptInfo, playWidth, audioInfo, digitalInfo, render, isPlaying, onPlayOrOnStop } = MakeStore
  const [isDragging, setIsDragging] = useState(false)
  const [ticks, setTicks] = useState<JSX.Element[]>()
  const sensors = useSensors(useSensor(PointerSensor, sensorOptions), useSensor(MouseSensor, sensorOptions), useSensor(TouchSensor, sensorOptions))
  const timelineRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const parRef = useRef<HTMLDivElement>(null)
  const baseCount = Math.ceil((parRef.current?.clientWidth || 0) / unit / gap)
  const containerScrollRef = useRef<number>(0)

  useEffect(() => {
    const element = () => {
      const tickCount = Math.ceil(totalTime / gap) + baseCount
      const ticks = []
      for (let i = 0; i <= tickCount; i++) {
        const isLargeTick = i % 10 === 0
        const tickLength = isLargeTick ? 10 : 5
        const tickStyle = {
          width: `${gap * unit}px`,
          height: `${tickLength}px`,
          borderLeft: '1px solid #333'
        }
        ticks.push(
          <div
            onClick={action(() => {
              MakeStore.playWidth = i * gap * unit
            })}
            key={i}
            style={tickStyle}
          >
            {isLargeTick && <span className="text-xs text-[#333]">{transformSeconds(gap * i)}</span>}
          </div>
        )
      }
      return ticks
    }
    setTicks(element())
  }, [totalTime, gap, unit])

  // const [pWidth, setPWidth] = useState(0)

  const onMouseDown = () => {
    setIsDragging(true)
    containerScrollRef.current = containerRef.current?.scrollLeft || 0
  }

  const onMouseUp = action(() => {
    setIsDragging(false)
  })
  const onMouseMove: MouseEventHandler = action(event => {
    if (isDragging) {
      event.preventDefault()
      const timeline = timelineRef.current
      const container = containerRef.current
      const par = parRef.current
      if (!timeline || !container || !par) return
      const containerRect = container.getBoundingClientRect()
      const x = event.clientX - containerRect.left + container.scrollLeft - containerScrollRef.current
      const newX = Math.max(0, Math.min(x, container.scrollWidth, totalWidth))
      if (event.clientX > par.clientWidth + par.offsetLeft - 80) {
        par.scrollLeft += 5
      } else if (event.clientX < par.offsetLeft + 80 && par.scrollLeft) {
        par.scrollLeft -= 5
      }
      MakeStore.playWidth = newX
      // setPWidth(newX)
    }
  })

  function handleDragEnd(event: DragEndEvent) {
    if (!pptInfo || !pptInfo.length) return
    const { active, over } = event
    if (over && active.id !== over.id) {
      runInAction(() => {
        MakeStore.pptInfo = arrayMove(pptInfo, Number(active.id), Number(over.id))
      })
    }
  }
  function handleDragAudioEnd(event: DragEndEvent) {
    if (!audioInfo || !audioInfo.length) return
    const { active, over } = event
    if (over && active.id !== over.id) {
      runInAction(() => {
        MakeStore.audioInfo = arrayMove(audioInfo, Number(active.id), Number(over.id))
      })
    }
  }

  const onMouseClear: MouseEventHandler = () => {
    setIsDragging(false)
  }

  return (
    <div className="flex flex-col w-full">
      <MakeHeader />
      <div className="flex-auto flex items-center justify-center">
        <div className="max-h-[100%] w-[960px] h-[540px] relative">
          <img className="h-full w-full object-contain" src={render} />
          {digitalInfo.map((item, index) => (
            <AvatarObject item={item} key={item.code + '_' + index}></AvatarObject>
          ))}
        </div>
      </div>
      <div className="flex text-xs justify-end items-center mt-8 bg-white h-10 px-5 w-full">
        缩放比例
        <MinusSquareOutlined
          onClick={() => {
            if (unit <= 1) {
              return
            }
            MakeStore.unit -= 0.1
          }}
          className="text-[14px] ml-2.5  mr-1 cursor-pointer opacity-70"
        />
        <Slider
          className="w-[200px]"
          max={20}
          min={1}
          step={0.1}
          tooltip={{ formatter: (val?: number | undefined) => `${val}` }}
          onChange={action(e => {
            MakeStore.unit = e
          })}
          value={unit}
        />
        <PlusSquareOutlined
          onClick={() => {
            if (unit >= 10) {
              return
            }
            MakeStore.unit += 0.1
          }}
          className="text-[14px] mx-1 cursor-pointer hover:opacity-70"
        />
      </div>
      <div className="w-full bg-white relative h-[240px] flex pt-2.5 pb-3.5">
        <div className="flex-[0_0_130px] flex items-center flex-col justify-center h-full">
          <div onClick={() => onPlayOrOnStop()} className="text-black text-[24px] cursor-pointer hover:opacity-70 flex items-center">
            {isPlaying ? <img src={PLAYINGPNG} className="w-7 h-7" /> : <PlayCircleOutlined />}
          </div>
          <div className="mt-5 text-black text-xs">
            {transformSeconds(playTime, 'seconds')} / {transformSeconds(totalTime, 'seconds')}
          </div>
        </div>
        <div className="w-[100px] flex flex-col justify-between">
          <div className="h-10 flex items-center w-full justify-center">时间轴</div>
          <div className="h-[60px] flex items-center w-full justify-center">PPT</div>
          <div className="h-[50px] flex items-center w-full justify-center">配音</div>
          <div className="h-[50px] flex items-center w-full justify-center">数字人</div>
        </div>
        <div ref={parRef} className="flex-auto px-5 overflow-auto select-none" onMouseMove={onMouseMove} onMouseUp={onMouseClear} onMouseLeave={onMouseClear}>
          <div style={{ width: totalWidth + 'px' }} ref={containerRef} className="relative h-full">
            <div className="w-full h-10 flex items-center">
              <div className="flex" style={{ borderTop: '1px solid #333' }}>
                {ticks}
              </div>
            </div>
            <div className="h-[60px] flex">
              <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToParentElement]} onDragEnd={handleDragEnd}>
                <SortableContext items={pptInfo.map((_, index) => String(index))} strategy={rectSortingStrategy}>
                  {pptInfo.map((item, index) => (
                    <PPTItem unit={unit} key={`${item.duration}_${item.src}_${index}`} item={item} index={index} />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            <div className="h-[50px] flex pt-2.5">
              <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToParentElement]} onDragEnd={handleDragAudioEnd}>
                <SortableContext items={audioInfo.map((_, index) => String(index))} strategy={rectSortingStrategy}>
                  {audioInfo.map((item, index) => (
                    <AudioItem unit={unit} key={`${item.duration}_${item.src}_${index}`} item={item} index={index} />
                  ))}
                </SortableContext>
              </DndContext>

              <div className="px-2.5 flex items-center border border-solid border-[#ccc] rounded">
                <Button type="link" onClick={action(() => AudioDrawerVisible.set(true))}>
                  +添加配音
                </Button>
              </div>
            </div>
            <div className="h-[50px] flex pt-2.5">
              {digitalInfo.length ? (
                digitalInfo.map((item, index) => <DigitalItem key={`${item.duration}_${index}`} item={item} />)
              ) : (
                <div className="px-2.5 flex items-center border border-solid border-[#ccc] rounded">
                  <Button
                    type="link"
                    onClick={action(() => {
                      AvatarDrawerVisible.set(true)
                    })}
                  >
                    +添加数字人
                  </Button>
                </div>
              )}
            </div>
            <div className="absolute h-full flex flex-col top-0 cursor-pointer hover:opacity-70" style={{ left: `${Math.min(playWidth, totalWidth)}px` }} ref={timelineRef} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
              <div className="h-[12px] text-[18px] mt-[-3px] text-[#ccc] relative top-[2px] right-[8.5px]">
                <CaretDownOutlined />
              </div>
              <div className="flex-auto bg-[#ccc] w-[2px]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

const AvatarObject = observer(function ({ item }: { item: AxisAvatarsType }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const parRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [left, setLeft] = useState(0)
  const [top, setTop] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const { zoom, src, scale, width: _width, height: _height, left: _left, top: _top } = item
  const originScale = _width / _height

  useEffect(() => {
    setWidth((_width / 2) * zoom * scale)
    setHeight((_height / 2) * zoom * scale)
  }, [_width, _height])

  useEffect(() => {
    // const { width, height } = box
    if (!left) {
      setLeft(_left / 2)
    }
    if (!top) {
      setTop(_top / 2)
    }
  }, [_left, _top])

  const handleResize = action((_: any, { size }: { size: any }) => {
    setWidth(size.width)
    setHeight(size.height)
  })
  const onMouseDown = () => {
    setIsDragging(true)
  }

  const onMouseUp = action(() => {
    item.left = left * 2
    item.top = top * 2
    setIsDragging(false)
  })

  const onMouseClear: MouseEventHandler = action(() => {
    item.left = left * 2
    item.top = top * 2
    setIsDragging(false)
  })

  const onMouseMove: MouseEventHandler = action(event => {
    if (isDragging) {
      event.preventDefault()
      const par = parRef.current
      const box = boxRef.current
      if (!par || !box) return
      const { x, y } = par.getBoundingClientRect()
      const { width, height } = box.getBoundingClientRect()

      const newX = Math.min(Math.max(event.clientX - x - width / 2, 0), par.clientWidth - width)
      const newY = Math.min(Math.max(event.clientY - y - height / 2, 0), par.clientHeight - height)

      setLeft(newX)
      setTop(newY)
    }
  })
  return (
    <div ref={parRef} className="w-full h-full absolute top-0 left-0" onMouseMove={onMouseMove} onMouseUp={onMouseClear} onMouseLeave={onMouseClear}>
      <ResizableBox
        className="absolute left-0 top-0 select-none"
        style={{ left: left, top: top }}
        width={width}
        height={height}
        onResize={handleResize}
        lockAspectRatio={true}
        maxConstraints={[originScale * 540, 540]}
        onResizeStop={action(() => {
          const scaleX = (width * 2) / _width / zoom
          item.scale = scaleX
        })}
        handle={<span className="absolute w-2 h-2 bg-[#1153aa] opacity-70 rounded bottom-[-4px] right-[-4px] cursor-nw-resize" />}
        draggableOpts={{ enableUserSelectHack: false }}
      >
        <div ref={boxRef} onMouseDown={onMouseDown} onMouseUp={onMouseUp} className="w-full h-full border-[2px] border-solid border-[#333] origin-top-left" style={{ left: left, top: top, width: width, height: height }}>
          <img src={src} className="w-full h-full" />
        </div>
      </ResizableBox>
    </div>
  )
})

const PPTItem = observer(function ({ item, unit, index }: { item: AxisImgType; unit: number; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(index) })
  const [width, setWidth] = useState(0)
  useEffect(() => {
    setWidth(item.duration * unit)
  }, [unit])
  const style = { width: width, background: `url(${item.src}) repeat`, backgroundSize: 'auto 100%', transform: CSS.Transform.toString(transform), transition }

  const handleResize = action((_: any, { size }: { size: any }) => {
    setWidth(size.width)
  })

  return (
    <Resizable
      className="relative"
      width={width}
      height={60}
      onResize={handleResize}
      onResizeStop={action(() => {
        item.duration = Math.ceil(width / unit)
      })}
      draggableOpts={{ enableUserSelectHack: false }}
      handle={<div className="absolute right-0 z-[10] cursor-col-resize top-0 w-[10px] h-full"></div>}
    >
      <div ref={setNodeRef} style={style} className={clsx('overflow-hidden flex-shrink-0 flex-grow-0 border border-solid border-[#ccc] h-full rounded relative', isDragging && 'z-10')}>
        <div {...attributes} {...listeners} className="absolute w-full right-[10px] h-full"></div>
      </div>
    </Resizable>
  )
})

const AudioItem = observer(function ({ item, unit, index }: { item: AxisAudiosType; unit: number; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(index) })
  const [width, setWidth] = useState(0)
  useEffect(() => {
    setWidth(item.duration * unit)
  }, [unit])
  const style = { width: width, transform: CSS.Transform.toString(transform), transition }

  const handleResize = action((_: any, { size }: { size: any }) => {
    setWidth(size.width)
  })
  if (item.type != 'blank') {
    return (
      <div ref={setNodeRef} {...attributes} {...listeners} style={style} className={clsx('flex-shrink-0 flex-grow-0 border border-solid border-[#ccc] h-full rounded relative', isDragging && 'z-10')}>
        <div
          onClick={action(() => {
            currentAudioInfo.set({ ...item, index })
            AudioDrawerVisible.set(true)
          })}
          className="h-full w-full flex items-center relative text-[#0068ff]"
        >
          <SoundOutlined className="ml-2.5" />
          <div className="flex-auto truncate items-center">{item.name || item.text}</div>
        </div>
      </div>
    )
  }

  return (
    <Resizable
      className="relative"
      width={width}
      height={40}
      onResize={handleResize}
      onResizeStop={action(() => {
        item.duration = Math.ceil(width / unit)
      })}
      draggableOpts={{ enableUserSelectHack: false }}
      handle={<div className="absolute right-0 z-[10] cursor-col-resize top-0 w-[10px] h-full"></div>}
    >
      <div ref={setNodeRef} style={style} className={clsx('overflow-hidden flex-shrink-0 flex-grow-0 border border-solid border-[#ccc] h-full rounded relative', isDragging && 'z-10')}>
        <div {...attributes} {...listeners} className="absolute w-full right-[10px] h-full">
          <div
            onClick={action(() => {
              currentAudioInfo.set({ ...item, index })
              AudioDrawerVisible.set(true)
            })}
            className="w-full h-full relative left-[10px] flex items-center justify-center text-[#333] text-xs whitespace-nowrap"
          >
            空白块
          </div>
        </div>
      </div>
    </Resizable>
  )
})

const DigitalItem = observer(function ({ item }: { item: AxisAvatarsType }) {
  const { totalWidth } = MakeStore

  return (
    <div
      onClick={action(() => {
        AvatarDrawerVisible.set(true)
      })}
      style={{ width: totalWidth }}
      className={clsx('flex items-center border border-solid border-[#ccc] h-full rounded relative')}
    >
      <div className=" px-1 w-full relative text-[#0068ff] truncate">{item.id}</div>
    </div>
  )
})

const AudioDrawer = observer(function () {
  const visible = AudioDrawerVisible.use()
  const [mode, setMode] = useState<'ai' | 'upload' | null>(null)
  const item = currentAudioInfo.use()
  const { type, index = 0 } = item || {}
  return (
    <Drawer
      className="payDrawer"
      placement="right"
      bodyStyle={{ padding: 0 }}
      width="400px"
      closable={false}
      onClose={action(() => {
        AudioDrawerVisible.set(false)
        currentAudioInfo.set(undefined)
        setMode(null)
      })}
      open={visible}
      destroyOnClose={true}
    >
      <div
        className="absolute top-[50%] translate-y-[-50%] left-[-20px] cursor-pointer hover:opacity-70"
        onClick={action(() => {
          AudioDrawerVisible.set(false)
          currentAudioInfo.set(undefined)
          setMode(null)
        })}
      >
        <img src={closeDrawer} className="w-[28px] h-[86px] object-cover" />
      </div>
      {!mode && !type && (
        <div className="p-5">
          <div className="text-xs font-semibold text-black">添加配音</div>
          <div className="mt-5 flex items-center">
            <div onClick={() => setMode('ai')}>
              <div className="w-[60px] h-[60px] rounded-lg flex items-center justify-center border border-solid border-[#bbb] text-lg cursor-pointer hover:opacity-70">
                <CustomerServiceOutlined />
              </div>
              <div className="text-xs text-black mt-2 text-center">AI配音</div>
            </div>
          </div>
        </div>
      )}

      {type == 'blank' && <Blank index={index}></Blank>}
      {type == 'mp3' && <Mp3Block index={index}></Mp3Block>}
      {(mode == 'ai' || type == 'tts') && <AIAudio index={index} item={item} setMode={setMode} />}
    </Drawer>
  )
})

const BlockButton = observer(function ({ type, index }: { type: 'mp3' | 'tts' | 'blank'; index: number }) {
  const { setAudioBlock, deleteAudioBlock, replaceAudioBlock } = MakeStore
  const onClick = action((btn: string) => {
    if (btn == 'middle') {
      if (type === 'blank') {
        deleteAudioBlock(index)
      } else {
        replaceAudioBlock(index)
      }
    }
    if (btn == 'left') {
      setAudioBlock(index)
    }
    if (btn == 'right') {
      setAudioBlock(index + 1)
    }
    AudioDrawerVisible.set(false)
    currentAudioInfo.set(undefined)
  })
  return (
    <div className="flex justify-center items-center mt-5">
      <Button type="primary" onClick={() => onClick('left')}>
        添加前空白块
      </Button>
      <Button type="primary" className="mx-5" danger onClick={() => onClick('middle')}>
        删除{type === 'blank' ? '空白' : '音频'}块
      </Button>
      <Button type="primary" onClick={() => onClick('right')}>
        添加后空白块
      </Button>
    </div>
  )
})

const Blank = observer(function ({ index }: { index: number }) {
  return (
    <div className="p-5 mt-2.5">
      <div className="text-xs font-semibold text-black">空白块</div>
      <BlockButton index={index} type="blank"></BlockButton>
    </div>
  )
})

const Mp3Block = observer(function ({ index }: { index: number }) {
  return (
    <div className="p-5 mt-2.5">
      <div className="text-xs font-semibold text-black">上传的音频</div>
      <BlockButton index={index} type="mp3"></BlockButton>
    </div>
  )
})

const AIAudio = observer(function ({ setMode, item, index }: { setMode: Function; item: AxisAudiosType | undefined; index: number }) {
  const { data } = useAIAudioTTS()
  const [content, setContent] = useState('')
  const [timbre, setTimbre] = useState('')
  const [name, setName] = useState('')
  const [tosUrl, setTosUrl] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [doneContent, setDoneContent] = useState('')
  const [duration, setDuration] = useState(0)
  const mutation = () => {
    //此mp3 url 仅示例 ,如url 无效可自行填入url链接
    const mp3Url = 'http://m701.music.126.net/20231011180341/1ba7dbe51d214db68fc0a3b8ee9b947a/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/28688036560/834c/b37a/56a6/b9d9e4287168750282552adc4d220445.mp3'

    setDoneContent(content)
    setTosUrl(mp3Url)
  }
  useEffect(() => {
    if (item) {
      const { src, duration, name, text, voice } = item
      setTosUrl(src)
      setDuration(duration)
      setName(name || '')
      setContent(text || '')
      setDoneContent(text || '')
      setTimbre(voice || '')
    }
  }, [item])
  useEffect(() => {
    if (data?.length) {
      const defaultId = data[0].key
      setTimbre(defaultId)
    }
  }, [data])
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onplaying = function () {
        setIsPlaying(true)
      }
      audioRef.current.onpause = function () {
        setIsPlaying(false)
      }
      audioRef.current.addEventListener('loadedmetadata', function () {
        setDuration(audioRef.current?.duration || 0)
      })
    }
  }, [])
  return (
    <div className="p-5">
      <div className="text-xs font-semibold text-black">① 添加文字</div>
      <div className="mt-2.5">
        <TextArea onChange={e => setContent(e.target.value)} value={content} showCount maxLength={300} autoSize={{ minRows: 10, maxRows: 13 }} placeholder="请输入文案，点击“确认”可将该段文案生成为AI语音，单段文案不可超过300个字" />
      </div>
      <div className="mb-2.5 mt-6 text-xs font-semibold text-black">② 选择语调</div>
      <div className="h-[350px] overflow-auto">
        {data?.map((item, index) => (
          <div onClick={() => setTimbre(item.key)} className="mb-2.5 mx-2.5 cursor-pointer hover:opacity-70 items-center px-1 py-2 rounded border border-solid flex" key={`${index}_${item.key}`} style={{ boxShadow: 'rgb(217, 217, 217) 0px 2px 6px 0px', borderColor: timbre == item.key ? '#608FFF' : '#f0f0f0' }}>
            <div className="flex-[0_0_40px] h-10 rounded-full overflow-hidden">
              <img className="w-full h-full object-contain" src={item.gender == '男' ? MALEPNG : FEMALEPNG} />
            </div>
            <div className="flex-auto text-xs text-black ml-5">{item.name}</div>
          </div>
        ))}
      </div>
      <div className="my-2.5 text-xs font-semibold text-black">③ 添加音频名称</div>
      <div>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="用于标识此音频,非必填" allowClear />
      </div>
      <div className="mt-8 text-center">
        <Button onClick={() => mutation} className="mr-2.5" type="primary" disabled={!timbre || !content}>
          生成
        </Button>
        <Button
          type="default"
          disabled={!tosUrl}
          onClick={() => {
            if (isPlaying) {
              audioRef.current?.pause()
              return
            }
            audioRef.current?.play()
          }}
        >
          {isPlaying ? '暂停' : '试听'}
        </Button>
        <Button
          onClick={action(() => {
            MakeStore.audioInfo.push({
              type: 'tts',
              src: tosUrl,
              duration,
              text: doneContent,
              name,
              voice: timbre
            })
            AudioDrawerVisible.set(false)
            setMode(null)
          })}
          disabled={!tosUrl || !duration}
          className="ml-2.5"
          type="primary"
        >
          插入到视频
        </Button>
        <audio ref={audioRef} src={tosUrl} />
      </div>

      {item?.type && <BlockButton index={index} type="tts"></BlockButton>}
    </div>
  )
})

const AvatarDrawer = observer(function () {
  const visible = AvatarDrawerVisible.use()
  const { data } = useAIAvatar()
  const [current, setCurrent] = useState<AxisAvatarsResType | null>(null)

  useEffect(() => {
    if (data?.length) {
      setCurrent(data[0])
    }
  }, [data])

  return (
    <Drawer
      className="payDrawer"
      placement="right"
      bodyStyle={{ padding: 0 }}
      width="400px"
      closable={false}
      onClose={action(() => {
        AvatarDrawerVisible.set(false)
      })}
      open={visible}
      destroyOnClose={true}
    >
      <div
        className="absolute top-[50%] translate-y-[-50%] left-[-20px] cursor-pointer hover:opacity-70"
        onClick={action(() => {
          AvatarDrawerVisible.set(false)
        })}
      >
        <img src={closeDrawer} className="w-[28px] h-[86px] object-cover" />
      </div>

      <div className="p-5">
        <div className="mb-2.5 mt-6 text-xs font-semibold text-black">选择数字人</div>
        <div className="h-[450px] overflow-auto">
          {data?.map((item, index) => (
            <div
              onClick={() => setCurrent(item)}
              className="mb-2.5 mx-2.5 cursor-pointer hover:opacity-70 items-center px-1 py-2 rounded border border-solid flex"
              key={`${index}_${item.VirtualmanKey}`}
              style={{ boxShadow: 'rgb(217, 217, 217) 0px 2px 6px 0px', borderColor: current?.VirtualmanKey == item.VirtualmanKey ? '#608FFF' : '#f0f0f0' }}
            >
              <div className="flex-[0_0_40px] h-10 overflow-hidden">
                <img className="w-full h-full object-contain" src={item.PoseImage} />
              </div>
              <div className="flex-auto text-xs text-black ml-5">{item.AnchorName}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button
            type="primary"
            block
            disabled={!current}
            onClick={action(() => {
              if (current) {
                const { anchorHeight, anchorWidth, AnchorCode, PoseImage, OriginZoom, VirtualmanKey } = current || {}
                MakeStore.digitalInfo = [
                  {
                    id: VirtualmanKey,
                    width: anchorWidth,
                    height: anchorHeight,
                    left: 0,
                    top: 0,
                    zoom: OriginZoom,
                    scale: 1,
                    duration: MakeStore.totalTime,
                    src: PoseImage,
                    code: AnchorCode
                  }
                ]
              }
              AvatarDrawerVisible.set(false)
            })}
          >
            插入数字人
          </Button>
        </div>
        {MakeStore.digitalInfo.length ? (
          <div className="mt-5">
            <Button
              type="primary"
              danger
              block
              onClick={action(() => {
                MakeStore.digitalInfo = []
                AvatarDrawerVisible.set(false)
              })}
            >
              删除数字人
            </Button>
          </div>
        ) : null}
      </div>
    </Drawer>
  )
})

const ExportModal = observer(function () {
  const visible = ExportModalVisible.use()
  const [val, setVal] = useState('')
  const { title, id, digitalInfo, audioInfo, pptInfo, metaId, folder } = MakeStore

  const mutation = () => {
    const data = {
      folder,
      metaId,
      count: 1,
      is_pub: false,
      title: val || title,
      project_id: id,
      project: { images: pptInfo, audios: audioInfo, avatars: digitalInfo }
    }
    console.log(data)
    message.success('导出成功')
    ExportModalVisible.set(false)
    successVisible.set(true)
  }

  return (
    <Modal maskClosable={false} destroyOnClose={true} title="导出视频" open={visible} onCancel={action(() => ExportModalVisible.set(false))} footer={null}>
      <div className="p-5">
        <div className="flex items-center mt-[18px]">
          <span className="inline-block mr-5 w-[100px]">视频标题</span>
          <Input placeholder="请输入视频标题(选填)" value={val} onChange={e => setVal(e.target.value)}></Input>
        </div>
        <div className="text-center mt-10">
          <Button type="primary" onClick={() => mutation}>
            确认导出
          </Button>
        </div>
      </div>
    </Modal>
  )
})

const SuccessModal = observer(function () {
  const visible = successVisible.use()
  const navigate = useNavigate()

  return (
    <Modal className="custom rounded-lg" open={visible} title={null} closable={false} footer={null} maskClosable={false} destroyOnClose={true}>
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-base">视频制作中，预计每个视频用时数分钟</div>
        <div className="mt-12">
          <Button
            type="primary"
            className="font-semibold text-xs"
            onClick={() => {
              navigate('/video-generator/ppt2video/list')
            }}
          >
            继续制作
          </Button>
          <Button
            className="font-semibold text-xs border-[#608fff] text-[#608fff] hover:bg-[#eef4ff] ml-5"
            onClick={action(() => {
              navigate('/video-generator/videos')
            })}
          >
            查看视频
          </Button>
        </div>
      </div>
    </Modal>
  )
})
