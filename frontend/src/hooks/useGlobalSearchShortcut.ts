import * as React from 'react'
import { useNavigate } from 'react-router-dom'

export function useGlobalSearchShortcut() {
  const navigate = useNavigate()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        // Focus navbar search input directly without navigating to separate page
        const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search deals"]')
        if (searchInput) {
          searchInput.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigate])
}