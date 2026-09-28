import client from './client.js'

export const sendMessage = (question) => client.post('/api/v1/chat', { question })

export const sendFeedback = (data) =>
  client.post('/api/v1/feedback', data).catch(() => null)
