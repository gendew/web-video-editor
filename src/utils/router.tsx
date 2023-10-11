import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const NavigateWithSearch = observer(function ({ to, replace, state }: { to: string; replace?: boolean; state?: any }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  useEffect(() => {
    navigate(
      {
        pathname: to,
        search: searchParams.toString()
      },
      { replace, state }
    )
  }, [])
  return null
})
