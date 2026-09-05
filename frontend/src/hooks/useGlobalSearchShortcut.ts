import * as React from 'react'
import { useNavigate } from 'react-router-dom'

export function useGlobalSearchShortcut() {
  const navigate = useNavigate()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        navigate('/search')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigate])
}