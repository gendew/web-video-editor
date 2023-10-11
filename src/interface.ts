export interface UserInfo {
  nickname: string
  avatar: string | null
  mobile: string | null
  company?: Company
  admin_flag?: number
  id: number
  is_vip: number
  is_dd_vip: number //一键主图是否标准版
  dd_vip_expire_at: string //一键主图到期时间
  vip_expire_at: string
  shop_name: string
  show_flag: number //用户是否显示 标识
  material_expire_at: string //素材清理时间
  fhd_video_expire_at: string //高清视频清理时间
  vip: Record<string, string>[] //拥有应用和过期时间
  point: number //用于AI 的点数
}

interface Company {
  company_name: string
}

export interface PresignedData {
  url: string
  check_code: string
  cdn_url: string
  header: Record<string, string>
}

export interface Paginated<DataItem> {
  data: DataItem[]
  total: number
  current_page: number
  per_page: number
  last_page: number
}

export interface S3Item {
  s3: string
  id: number
}

export interface FyParams {
  name: string
  price: string
  gender: string
  time: string
  func: string
  is_same: string
  brand: string
  season: string
}

export interface GoodsListItem {
  id: number
  article: string
  images: S3Item[] | null
  videos: S3Item[] | null
  company_id: number
  created_at: string
  source: number
  title: string | null
  status: number
  product_type: string | null
  images_num: number
  videos_num: number
  brand_name: string
  model_name: string
  div: string
  gender: string
  category: any
  themes: any
  rp: string
  task_num: number
  num: number
  finish_num: number
  is_finish: number
  douyin_num: number
  dd_tag_name: string | null
  fy_desc: S3Item[] | null
  fy_params: FyParams | null
  fy_task_status: TaskStatus
  updated_at: string | null
  required_num: number | null
  exist_num: number | null
  dd_id?: string
  dd_status?: TaskStatus
  dd_params_add: number | null
  info_num: number | null
  info_total: number | null
}

export interface TaskGoodsItem {
  aid: number
  article: string
  company_id: number
  end_tm: string | null
  finish_num: number
  id: number
  is_finish: number
  list_id: number
  num: number
  status: number
}

export interface TaskGoodsDetailItem extends TaskGoodsItem {
  article_info: {
    id: number
    article: string
    images: S3Item[] | null
    videos: S3Item[] | null
    company_id: number
    source: number
    title: string
    status: number
    product_type: null
    images_num: number
    videos_num: number
    price: null
    article_code: null
    size: null
    dd_tag_name: string | null
    fy_desc: S3Item[] | null
    fy_params: FyParams | null
  } | null
}

export interface AuthItem {
  id: number
  company_id: number
  dk_openid: string
  dk_unionid: string
  dk_nickname: string
  dk_avatar: string
  updated_at: string
  status: number
  user_id: number
  bus_code: string
}

export interface VideoTaskItem {
  id: number
  title: string
  shop: string
  operator: string
  created_at: string
  status: number
  company_id: number
  user_id: number
  num: number
  finish_num: number
  is_finish: number
}

export interface GoodsVideoItem {
  id: number
  item_id: number
  title: string
  douyin_item: string
  article: string
  status: number
  s3_path: string
  douyin_tm: string
  admin: string
  company_id: number
  updated_at: string
  s3_image: string
  douyin_title: string
  shop_id: number
  task_status: number
  task_tm: string
  douyin_status: number
  list_id: number
  back_link?: BackLink | null
}

export interface BackLink {
  id: number
  video_id: number
  dy_item_id: string
  open_id: string
  is_reviewed: boolean
  is_top: boolean
  share_count: string
  forward_count: string
  comment_count: string
  digg_count: string
  download_count: string
  play_count: string
  video_status: number
  share_url: string
  updated_at: string
}

export interface CategoryInfo {
  enable: boolean
  id: number
  is_leaf: boolean
  level: number
  name: string
  parent_id: number
}

export type TaskStatus = 0 | 1 | -1

export interface AsyncTaskItem {
  article: number
  brand: string
  status: TaskStatus
  sort: number
}

export interface AsyncTaskInfo {
  status: 0 | 1 | -1 | -2
  list: AsyncTaskItem[]
}

export interface MatlItem {
  source: string
  type: string
}

export interface GroupItem {
  group_description?: string
  group_id: number
  group_name: string
  group_sort: number
  is_buy: number
  link_path?: string
}

export interface AppItem {
  id: number
  group_id: number
  group_name: string
  group_path: string | null
  name: string
  func_name: string
  is_buy: number
  link_path: string | null
  created_at: string | null
  updated_at: string | null
  description: string | null
}
