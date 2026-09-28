import client from './client.js'

export const checkHealth = () => client.get('/api/v1/health')
