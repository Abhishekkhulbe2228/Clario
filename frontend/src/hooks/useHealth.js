import { useState, useEffect, useCallback } from 'react'
import { checkHealth } from '../api/health.js'

export function useHealth(interval = 30000) {
  const [status, setStatus] = useState('checking') // 'ok' | 'error' | 'checking'

  const check = useCallback(async () => {
    try {
      await checkHealth()
      setStatus('ok')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    check()
    const id = setInterval(check, interval)
    return () => clearInterval(id)
  }, [check, interval])

  return status
}
