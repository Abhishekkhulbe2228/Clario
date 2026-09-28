import { useState, useEffect } from 'react'
import { getTheme, setTheme } from '../utils/storage.js'

export function useTheme() {
  const [theme, setThemeState] = useState(getTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    setTheme(theme)
  }, [theme])

  const toggle = () => setThemeState(t => t === 'dark' ? 'light' : 'dark')

  return { theme, toggle, setTheme: setThemeState }
}
