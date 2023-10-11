import { action, makeAutoObservable, runInAction } from 'mobx'
import { State } from '../core'

export const AudioDrawerVisible = new State(() => false)

export const AvatarDrawerVisible = new State(() => false)

export const ExportModalVisible = new State(() => false)

export const successVisible = new State(() => false)

export interface ProjectResType {
  meta: {
    title: string
    id: string
    folder: string
  }
  timeline: {
    images: AxisImgType[]
    audios: AxisAudiosType[]
    avatars: AxisAvatarsType[]
    captions?: string
  }
}

export interface AxisImgType {
  src: string
  duration: number
}
export interface AxisAudiosType {
  index?: number
  type: 'mp3' | 'tts' | 'blank'
  src: string
  duration: number
  name?: string
  text?: string
  voice?: string
  ss?: number
}
export interface AxisAvatarsType {
  id: string
  left: number
  top: number
  width: number
  height: number
  zoom: number
  scale: number
  duration: number
  src: string
  code: string
}

export const currentAudioInfo = new State<AxisAudiosType | undefined>(() => undefined)

export const MakeStore = makeAutoObservable(
  {
    timer: {} as any,
    title: '', //项目名称
    id: '', //项目id
    metaId: '',
    folder: '', //项目文件目录
    unit: 10, //时间 秒 => 像素px 比例
    gap: 6, //大刻度的时间间隔 单位秒
    pptInfo: [] as AxisImgType[], //ppt信息
    audioInfo: [] as AxisAudiosType[],
    digitalInfo: [] as AxisAvatarsType[],
    playWidth: 0,
    isPlaying: false,
    get playTime() {
      //播放中的时间
      return Math.ceil(this.playWidth / this.unit)
    },
    get render() {
      let t = 0
      for (let i = 0; i < this.pptInfo.length; i++) {
        if (i === this.pptInfo.length - 1) {
          t += this.pptInfo[this.pptInfo.length - 1].duration
        }
        t += this.pptInfo[i].duration

        if (t > this.playTime) {
          return this.pptInfo[i].src
        }
      }
    },
    get totalWidth() {
      //总长度
      return this.totalTime * this.unit
    },
    get pptTotalTime() {
      return this.pptInfo.reduce((pre: number, next: AxisImgType) => pre + next.duration, 0) as number
    },
    get totalTime() {
      //总时长
      const audioTime = this.audioInfo.reduce((pre: number, next: AxisAudiosType) => pre + next.duration, 0) as number
      return Math.max(this.pptTotalTime, audioTime)
    },
    onPlayOrOnStop() {
      if (this.isPlaying) {
        clearInterval(this.timer)
        this.isPlaying = false
        return
      }
      this.isPlaying = true
      this.timer = setInterval(
        action(() => {
          if (this.playTime == this.totalTime) {
            clearInterval(this.timer)
            this.isPlaying = false
            return
          }
          this.playWidth += 1
        }),
        100
      )
    },
    setAudioBlock(index: number) {
      this.audioInfo.splice(index, 0, {
        duration: 10,
        src: '',
        type: 'blank'
      })
    },
    deleteAudioBlock(index: number) {
      this.audioInfo.splice(index, 1)
    },
    replaceAudioBlock(index: number) {
      const audioInfo = this.audioInfo[index]
      this.audioInfo[index] = {
        type: 'blank',
        text: '',
        voice: '',
        duration: audioInfo.duration,
        src: '',
        name: ''
      }
    },
    clear() {
      //初始化class里所有属性
      this.audioInfo = []
      this.pptInfo = []
      this.digitalInfo = []
      this.id = ''
      this.title = ''
      this.playWidth = 0
      this.unit = 10
    },
    async getProjectInfo(id: string) {
      //图片无效的请自行替换地址
      const data = {
        meta: {
          title: '这里是标题',
          id: '202308101539074e56407161b0ad4c4f54890e4c5b2584',
          folder: 'xxxx'
        },
        timeline: {
          images: [
            {
              src: 'https://p1-q.mafengwo.net/s9/M00/9A/EF/wKgBs1dx0o2AYg4lABH_hcgMPnQ93.jpeg',
              duration: 5,
              width: 1920,
              height: 1080
            },
            {
              src: 'https://lmg.jj20.com/up/allimg/1113/041620104229/200416104229-8-1200.jpg',
              duration: 5,
              width: 1920,
              height: 1080
            },
            {
              src: 'https://lmg.jj20.com/up/allimg/tp10/2109261124125L4-0-lp.jpg',
              duration: 5,
              width: 1920,
              height: 1080
            },
            {
              src: 'https://pic.616pic.com/photoone/00/00/56/618ce8b3797b76152.jpg',
              duration: 5,
              width: 1920,
              height: 1080
            },
            {
              src: 'https://lmg.jj20.com/up/allimg/tp10/2202091151523M2-0-lp.jpg',
              duration: 5,
              width: 1920,
              height: 1080
            },
            {
              src: 'https://img10.51tietu.net/pic/20191030/k2hqdmpfendk2hqdmpfend.jpg',
              duration: 5,
              width: 1920,
              height: 1080
            },
            {
              src: 'https://img10.51tietu.net/pic/20191030/k2hqdmpfendk2hqdmpfend.jpg',
              duration: 5,
              width: 1920,
              height: 1080
            },
            {
              src: 'https://lmg.jj20.com/up/allimg/tp05/1Z92Z0441539A-0-lp.jpg',
              duration: 5,
              width: 1920,
              height: 1080
            }
          ],
          captions: '',
          audios: [],
          avatars: []
        }
      }

      const { meta, timeline } = data || {}
      const { title, id: metaId, folder } = meta || {}
      const { images, audios, avatars } = timeline || {}
      runInAction(() => {
        this.folder = folder || ''
        this.id = id || ''
        this.metaId = metaId || ''
        this.title = title || ''
        this.audioInfo = audios || []
        this.pptInfo = images || []
        this.digitalInfo = avatars || []
      })
    }
  },
  {},
  { autoBind: true }
)

export interface AIAudioResType {
  gender: string
  key: string
  name: string
}

export function useAIAudioTTS() {
  const data = [
    {
      key: 'zh-CN-XiaoxiaoNeural',
      name: '小小',
      gender: '女'
    },
    {
      key: 'zh-CN-YunxiNeural',
      name: '云溪',
      gender: '男'
    },
    {
      key: 'zh-CN-YunjianNeural',
      name: '云剑',
      gender: '男'
    },
    {
      key: 'zh-CN-XiaoyiNeural',
      name: '小艺',
      gender: '女'
    },
    {
      key: 'zh-CN-YunyangNeural',
      name: '云阳',
      gender: '男'
    },
    {
      key: 'zh-CN-XiaochenNeural',
      name: '小陈',
      gender: '女'
    },
    {
      key: 'zh-CN-XiaohanNeural',
      name: '小韩',
      gender: '女'
    },
    {
      key: 'zh-CN-XiaomengNeural',
      name: '小萌',
      gender: '女'
    },
    {
      key: 'zh-CN-XiaomoNeural',
      name: '小沫',
      gender: '女'
    },
    {
      key: 'zh-CN-XiaoqiuNeural',
      name: '小秋',
      gender: '女'
    },
    {
      key: 'zh-CN-XiaoruiNeural',
      name: '小芮',
      gender: '女'
    },
    {
      key: 'zh-CN-XiaoshuangNeural',
      name: '小双',
      gender: '女'
    },
    {
      key: 'zh-CN-XiaoxuanNeural',
      name: '小轩',
      gender: '女'
    },
    {
      key: 'zh-CN-XiaoyanNeural',
      name: '晓燕',
      gender: '女'
    },
    {
      key: 'zh-CN-XiaoyouNeural',
      name: '小佑',
      gender: '女'
    },
    {
      key: 'zh-CN-XiaozhenNeural',
      name: '小珍',
      gender: '女'
    },
    {
      key: 'zh-CN-YunfengNeural',
      name: '云枫',
      gender: '男'
    },
    {
      key: 'zh-CN-YunhaoNeural',
      name: '云豪',
      gender: '男'
    },
    {
      key: 'zh-CN-YunxiaNeural',
      name: '云夏',
      gender: '男'
    },
    {
      key: 'zh-CN-YunyeNeural',
      name: '云烨',
      gender: '男'
    },
    {
      key: 'zh-CN-YunzeNeural',
      name: '云泽',
      gender: '男'
    }
  ]
  return { data }
}

export interface AxisAvatarsResType {
  AnchorName: string
  PoseImage: string
  AnchorCode: string
  OriginZoom: number
  VirtualmanKey: string
  anchorHeight: number
  anchorWidth: number
}

export function useAIAvatar() {
  const data = [
    {
      OriginZoomStr: '0.497',
      OriginZoom: 0.49700000882149,
      ClothesName: '粉短裙套装',
      PoseName: '全身站姿',
      Resolution: '1920x1080',
      HeaderImage: 'https://virtualhuman-cos-prod-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/c0948a75-b4fd-461e-88e6-c15ef7c3b8f7-weilan_xyb_fenfuanqun.png',
      PoseImage: 'https://virtualhuman-cos-prod-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/10339021-fa26-4efe-8e78-ab27a916baec-weilan_xyb_fenfuanqun.png',
      ClothesImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/00e92768-3d23-40d7-aa39-94df36a44a38-Mask group粉短裙套装.png',
      SupportDriverTypes: ['Text', 'OriginalVoice', 'ModulatedVoice'],
      VideoDuration: 15040,
      ExpireDate: '2024-07-26 09:57:45',
      VirtualmanKey: '77dbff87532e4774b12fec5759eaf9ee',
      VideoNum: 1,
      AnchorName: '微澜粉短裙套装',
      AnchorCode: 'wl_pink_skirt_suit_stand',
      EffectiveDate: '2023-07-26 09:57:45',
      ReferenceVideoSegmentUrl: '',
      anchorWidth: 1042,
      anchorHeight: 1912
    },
    {
      OriginZoomStr: '0.900',
      OriginZoom: 0.89999997615814,
      ClothesName: '豆沙粉连体裤',
      PoseName: '坐姿',
      Resolution: '1920x1080',
      HeaderImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/prod/resource-manager/small/57/163/179/model_238_20221201104028/static_rgba.png',
      PoseImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/prod/resource-manager/small/57/163/179/model_238_20221201104028/static_rgba.png',
      ClothesImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/3cc2591e-8ca9-4ad7-8cf1-65e7133967b5-服装_豆沙粉连体裤.png',
      SupportDriverTypes: ['Text', 'OriginalVoice', 'ModulatedVoice'],
      VideoDuration: 0,
      ExpireDate: '2024-07-26 09:57:45',
      VirtualmanKey: 'e1b469d23d2b4ac2adc3562798b08959',
      VideoNum: 0,
      AnchorName: '微澜豆沙粉连体裤',
      AnchorCode: 'wl_Bean_Paste_Powder_Jumpsuit_sit',
      EffectiveDate: '2023-07-26 09:57:45',
      ReferenceVideoSegmentUrl: '',
      anchorWidth: 1180,
      anchorHeight: 1050
    },
    {
      OriginZoomStr: '0.500',
      OriginZoom: 0.5,
      ClothesName: '蓝色七分袖套裙',
      PoseName: '全身站姿',
      Resolution: '1920x1080',
      HeaderImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/prod/resource-manager/small/57/156/173/model_244_20221201105920/static_rgba.png',
      PoseImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/prod/resource-manager/small/57/156/173/model_244_20221201105920/static_rgba.png',
      ClothesImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/6fa877b0-107b-4c09-b45d-c4c5e9981635-服装_蓝色七分袖套裙.png',
      SupportDriverTypes: ['Text', 'OriginalVoice', 'ModulatedVoice'],
      VideoDuration: 0,
      ExpireDate: '2024-07-26 09:57:45',
      VirtualmanKey: '1f75ad37a4c1434fa977a6ca28acd3f0',
      VideoNum: 0,
      AnchorName: '微澜蓝色七分袖套裙',
      AnchorCode: 'wl_blue_7_sleeve_dress_stand',
      EffectiveDate: '2023-07-26 09:57:45',
      ReferenceVideoSegmentUrl: '',
      anchorWidth: 492,
      anchorHeight: 1890
    },
    {
      OriginZoomStr: '1.009',
      OriginZoom: 1.0089999437332,
      ClothesName: '蓝色七分袖套裙',
      PoseName: '坐姿',
      Resolution: '1920x1080',
      HeaderImage: 'https://virtualhuman-cos-prod-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/7e2c2b95-347f-4c56-b1be-f22c333cc560-weilan_xyb_ls7_half.png',
      PoseImage: 'https://virtualhuman-cos-prod-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/03e5e6d6-f790-4777-9aea-77ddcbdd77dd-weilan_xyb_ls7_half.png',
      ClothesImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/c6f4c915-dbd9-44cf-ab39-57e718cbc5f7-服装_蓝色七分袖套裙.png',
      SupportDriverTypes: ['Text', 'OriginalVoice', 'ModulatedVoice'],
      VideoDuration: 0,
      ExpireDate: '2024-07-26 09:57:45',
      VirtualmanKey: 'dbd78ec2a0304c51a46ed020eaae02a7',
      VideoNum: 0,
      AnchorName: '微澜蓝色七分袖套裙',
      AnchorCode: 'wl_blue_7_sleeve_dress_sit',
      EffectiveDate: '2023-07-26 09:57:45',
      ReferenceVideoSegmentUrl: '',
      anchorWidth: 1116,
      anchorHeight: 1070
    },
    {
      OriginZoomStr: '0.504',
      OriginZoom: 0.50400000810623,
      ClothesName: '莫兰迪蓝无袖裙',
      PoseName: '全身站姿',
      Resolution: '1920x1080',
      HeaderImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/prod/resource-manager/small/57/153/175/model_223_20221201112348/static_rgba.png',
      PoseImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/prod/resource-manager/small/57/153/175/model_223_20221201112348/static_rgba.png',
      ClothesImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/fdd5f1f6-042f-4f9e-889c-a783d73fed35-服装_莫兰迪无袖裙.png',
      SupportDriverTypes: ['Text', 'OriginalVoice', 'ModulatedVoice'],
      VideoDuration: 0,
      ExpireDate: '2024-07-26 09:57:45',
      VirtualmanKey: 'aae4ec55d5a5433d91aaf00395498c17',
      VideoNum: 0,
      AnchorName: '微澜莫兰迪蓝无袖裙',
      AnchorCode: 'wl_Morandi_blue_sleeveless_skirt_stand',
      EffectiveDate: '2023-07-26 09:57:45',
      ReferenceVideoSegmentUrl: '',
      anchorWidth: 448,
      anchorHeight: 1876
    },
    {
      OriginZoomStr: '0.914',
      OriginZoom: 0.91399997472763,
      ClothesName: '莫兰迪蓝无袖裙',
      PoseName: '坐姿',
      Resolution: '1920x1080',
      HeaderImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/prod/resource-manager/small/57/162/166/model_242_20221201104040/static_rgba.png',
      PoseImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/prod/resource-manager/small/57/162/166/model_242_20221201104040/static_rgba.png',
      ClothesImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/15df9f0d-933d-45df-87c3-a3d4b9dd1d1f-服装_莫兰迪无袖裙.png',
      SupportDriverTypes: ['Text', 'OriginalVoice', 'ModulatedVoice'],
      VideoDuration: 0,
      ExpireDate: '2024-07-26 09:57:45',
      VirtualmanKey: '797dfc2e9e8a404aa9bbbb4866f41ccf',
      VideoNum: 0,
      AnchorName: '微澜莫兰迪蓝无袖裙',
      AnchorCode: 'wl_Morandi_blue_sleeveless_skirt_sit',
      EffectiveDate: '2023-07-26 09:57:45',
      ReferenceVideoSegmentUrl: '',
      anchorWidth: 1172,
      anchorHeight: 1034
    },
    {
      OriginZoomStr: '0.514',
      OriginZoom: 0.51399999856949,
      ClothesName: '挂脖连衣裙',
      PoseName: '全身站姿',
      Resolution: '1920x1080',
      HeaderImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/prod/resource-manager/small/57/151/114/model_248_20221201110233/static_rgba.png',
      PoseImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/prod/resource-manager/small/57/151/114/model_248_20221201110233/static_rgba.png',
      ClothesImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/0228f5a9-063c-4e5d-853b-2ee16b885ab2-服装_挂脖连衣裙.png',
      SupportDriverTypes: ['Text', 'OriginalVoice', 'ModulatedVoice'],
      VideoDuration: 0,
      ExpireDate: '2024-07-26 09:57:45',
      VirtualmanKey: 'd76e51573fa34cc0b45f09e2872a94d4',
      VideoNum: 0,
      AnchorName: '微澜挂脖连衣裙',
      AnchorCode: 'wl_halter_dress_stand',
      EffectiveDate: '2023-07-26 09:57:45',
      ReferenceVideoSegmentUrl: '',
      anchorWidth: 446,
      anchorHeight: 1838
    },
    {
      OriginZoomStr: '0.910',
      OriginZoom: 0.91000002622604,
      ClothesName: '香槟色西装套装',
      PoseName: '坐姿',
      Resolution: '1920x1080',
      HeaderImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/prod/resource-manager/small/57/157/110/model_153_20221201110411/static_rgba.png',
      PoseImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/prod/resource-manager/small/57/157/110/model_153_20221201110411/static_rgba.png',
      ClothesImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/bdefb86b-ff8a-4945-8132-eb068a3df92a-服装_香槟色西装套装.png',
      SupportDriverTypes: ['Text', 'OriginalVoice', 'ModulatedVoice'],
      VideoDuration: 0,
      ExpireDate: '2024-07-26 09:57:45',
      VirtualmanKey: '9b96ae9a50f34160bd6e127920172a1e',
      VideoNum: 0,
      AnchorName: '微澜香槟色西装套装',
      AnchorCode: 'wl_champagne_suit_sit',
      EffectiveDate: '2023-07-26 09:57:45',
      ReferenceVideoSegmentUrl: '',
      anchorWidth: 576,
      anchorHeight: 1038
    },
    {
      OriginZoomStr: '0.511',
      OriginZoom: 0.51099997758865,
      ClothesName: '香槟色西装套装',
      PoseName: '全身站姿',
      Resolution: '1920x1080',
      HeaderImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/prod/resource-manager/small/57/152/174/model_219_20221201110031/static_rgba.png',
      PoseImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/prod/resource-manager/small/57/152/174/model_219_20221201110031/static_rgba.png',
      ClothesImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/c9765ade-bd2d-4c7f-b0c0-db80ff925e00-服装_香槟色西装套装.png',
      SupportDriverTypes: ['Text', 'OriginalVoice', 'ModulatedVoice'],
      VideoDuration: 0,
      ExpireDate: '2024-07-26 09:57:45',
      VirtualmanKey: '833e600f23f943558843daf8c5182889',
      VideoNum: 0,
      AnchorName: '微澜香槟色西装套装',
      AnchorCode: 'wl_champagne_suit_half_stand',
      EffectiveDate: '2023-07-26 09:57:45',
      ReferenceVideoSegmentUrl: '',
      anchorWidth: 504,
      anchorHeight: 1848
    },
    {
      OriginZoomStr: '0.883',
      OriginZoom: 0.88300001621246,
      ClothesName: '粉短裙套装',
      PoseName: '半身站姿',
      Resolution: '1920x1080',
      HeaderImage: 'https://virtualhuman-cos-prod-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/517e6fa8-0cb9-4048-9912-239558ce0365-weilan_xyb_fenfuanqun_half.png',
      PoseImage: 'https://virtualhuman-cos-prod-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/21f0c8d1-ad67-4a96-bb59-95b415a32bda-weilan_xyb_fenfuanqun_half.png',
      ClothesImage: 'https://virtualhuman-cos-test-1251316161.cos.ap-nanjing.myqcloud.com/virtualman-config/9bd280bf-a954-4879-b262-45d93e2e191f-Mask group粉短裙套装.png',
      SupportDriverTypes: ['Text', 'OriginalVoice', 'ModulatedVoice'],
      VideoDuration: 0,
      ExpireDate: '2024-07-26 09:57:45',
      VirtualmanKey: 'e3377a6f055e4e9b9295fde50d434ac3',
      VideoNum: 0,
      AnchorName: '微澜粉短裙套装',
      AnchorCode: 'wl_pink_skirt_suit_half_stand',
      EffectiveDate: '2023-07-26 09:57:45',
      ReferenceVideoSegmentUrl: '',
      anchorWidth: 800,
      anchorHeight: 1074
    }
  ]

  return { data }
}
