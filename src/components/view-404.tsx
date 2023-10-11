import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { Result, Button } from 'antd'

export const View404 = observer(function View404() {
  const navigate = useNavigate()

  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，您访问的页面不存在"
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          回到首页
        </Button>
      }
    />
  )
})
