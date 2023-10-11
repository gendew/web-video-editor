import { Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import zh_CN from 'antd/es/locale/zh_CN'
import { NavigateWithSearch } from '@/utils'
import { View404 } from '@/components/view-404'
// import { AuthDouyinView } from './components/video-pub/auth'
import { PPTToVideoEdit } from './components/ppt2video/edit'
import { queryClient } from './store/query'

const prefixCls = 'coll'
const iconPrefixCls = 'collicon'
ConfigProvider.config({ prefixCls, iconPrefixCls })

export default observer(function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zh_CN} autoInsertSpaceInButton={false} prefixCls={prefixCls} iconPrefixCls={iconPrefixCls}>
        <Suspense>
          {useRoutes([
            { path: '/', element: <NavigateWithSearch to="/ppt2video" replace={true} /> },
            {
              path: '/ppt2video',
              element: <PPTToVideoEdit />
            },
            { path: '*', element: <View404 /> }
          ])}
        </Suspense>
      </ConfigProvider>
    </QueryClientProvider>
  )
})
