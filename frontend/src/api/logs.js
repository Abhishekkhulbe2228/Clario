import client from './client.js'

export const getAuditLogs = (params = {}) => {
  const q = new URLSearchParams(params).toString()
  return client.get(`/api/v1/audit${q ? '?' + q : ''}`)
}

export const getAuditStats = () =>
  client.get('/api/v1/audit/stats').catch(() => null)
