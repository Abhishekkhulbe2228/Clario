import client from './client.js'

export const uploadDocument = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return client.postForm('/api/v1/ingest', formData)
}

export const listDocuments = () =>
  client.get('/api/v1/documents').catch(() => ({ documents: [] }))
