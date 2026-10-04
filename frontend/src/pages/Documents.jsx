import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader, X, RefreshCw, Trash2 } from 'lucide-react'
import EmptyState from '../components/common/EmptyState.jsx'
import { uploadDocument, listDocuments, deleteDocument } from '../api/documents.js'
import clsx from 'clsx'

const SUPPORTED = ['.pdf', '.docx', '.txt', '.md']

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function UploadStatus({ upload }) {
  return (
    <div className={clsx(
      'p-4 rounded-xl border',
      upload.status === 'done' ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' :
      upload.status === 'error' ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' :
      'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{upload.name}</span>
        </div>
        {upload.status === 'done' && <CheckCircle size={16} className="text-green-600 dark:text-green-400" />}
        {upload.status === 'error' && <AlertCircle size={16} className="text-red-600 dark:text-red-400" />}
        {upload.status === 'uploading' && <Loader size={16} className="text-blue-600 dark:text-blue-400 animate-spin" />}
      </div>
      {upload.status === 'uploading' && (
        <>
          <div className="w-full bg-blue-200 dark:bg-blue-900/40 rounded-full h-1.5 mb-2">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${upload.progress}%` }}
            />
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-400">{upload.stage}</p>
        </>
      )}
      {upload.status === 'done' && (
        <p className="text-xs text-green-700 dark:text-green-400">
          Indexed {upload.result?.chunks} chunks · {upload.result?.ids_created} vectors created
        </p>
      )}
      {upload.status === 'error' && (
        <p className="text-xs text-red-700 dark:text-red-400">{upload.error}</p>
      )}
    </div>
  )
}

export default function DocumentsPage() {
  const [dragging, setDragging] = useState(false)
  const [uploads, setUploads] = useState([])
  const [documents, setDocuments] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [docError, setDocError] = useState(null)
  const fileRef = useRef()

  const fetchDocs = useCallback(async () => {
    setLoadingDocs(true)
    setDocError(null)
    try {
      const res = await listDocuments()
      setDocuments(res?.documents || [])
    } catch (err) {
      setDocError(err.message || 'Failed to load documents')
    } finally {
      setLoadingDocs(false)
    }
  }, [])

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const handleDeleteDoc = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the knowledge base?`)) return
    try {
      await deleteDocument(id)
      setDocuments(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      alert(err.message || 'Failed to delete document')
    }
  }

  const processFile = useCallback(async (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!SUPPORTED.includes(ext)) {
      setUploads(prev => [...prev, { id: Date.now(), name: file.name, status: 'error', error: `Unsupported format. Supported: ${SUPPORTED.join(', ')}` }])
      return
    }

    const id = Date.now() + Math.random()
    const stages = ['Uploading document...', 'Processing document...', 'Creating chunks...', 'Generating embeddings...', 'Indexing knowledge...']
    let stageIdx = 0

    setUploads(prev => [...prev, { id, name: file.name, status: 'uploading', progress: 0, stage: stages[0] }])

    // Animate stages
    const stageTimer = setInterval(() => {
      stageIdx++
      if (stageIdx < stages.length) {
        setUploads(prev => prev.map(u => u.id === id ? { ...u, stage: stages[stageIdx], progress: Math.round((stageIdx / stages.length) * 85) } : u))
      }
    }, 800)

    try {
      const result = await uploadDocument(file)
      clearInterval(stageTimer)
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'done', progress: 100, result } : u))
      fetchDocs()
    } catch (err) {
      clearInterval(stageTimer)
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'error', error: err.message } : u))
    }
  }, [fetchDocs])

  const handleFiles = (files) => {
    Array.from(files).forEach(processFile)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">HR Knowledge Base</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage the documents Clario uses to answer employee questions.
          </p>
        </div>

        {/* Admin key notice */}
        <div className="mb-4 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-start gap-2">
          <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Document upload requires an authenticated HR administrator session. Sign in from the Admin page before uploading.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={clsx(
            'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 mb-6',
            dragging
              ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/10 scale-[1.01]'
              : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-gray-50 dark:hover:bg-gray-800/30'
          )}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md"
            className="sr-only"
            onChange={e => handleFiles(e.target.files)}
            aria-label="Upload HR documents"
          />
          <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-3">
            <Upload size={22} className="text-brand-600 dark:text-brand-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Drop HR documents here or <span className="text-brand-600 dark:text-brand-400">browse files</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Supports PDF, DOCX, TXT, Markdown
          </p>
        </div>

        {/* Upload statuses */}
        {uploads.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Uploads</h2>
              <button
                onClick={() => setUploads(prev => prev.filter(u => u.status === 'uploading'))}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Clear completed
              </button>
            </div>
            {uploads.map(u => <UploadStatus key={u.id} upload={u} />)}
          </div>
        )}

        {/* Document list */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Indexed Documents</h2>
            <button
              onClick={fetchDocs}
              disabled={loadingDocs}
              className="text-xs text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 transition-colors disabled:opacity-50"
              aria-label="Refresh document list"
            >
              <RefreshCw size={11} className={clsx(loadingDocs && 'animate-spin')} /> {loadingDocs ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {docError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 text-xs text-red-600 dark:text-red-400 flex items-center justify-between">
              <span>{docError}</span>
              <button onClick={fetchDocs} className="underline hover:no-underline font-medium">Retry</button>
            </div>
          )}

          {loadingDocs && documents.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <Loader size={14} className="animate-spin text-brand-500" />
              Loading indexed documents…
            </div>
          ) : documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No HR documents yet"
              description="Upload approved company documents to build Clario's knowledge base. Documents will be chunked, embedded, and indexed automatically."
            />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{doc.filename}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {doc.chunks ? `${doc.chunks} chunks · ` : ''}{formatBytes(doc.byte_size)}{doc.created_at ? ` · ${formatDate(doc.created_at)}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={clsx(
                      'text-[10px] font-medium px-2 py-0.5 rounded-full capitalize',
                      doc.status === 'ready' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      doc.status === 'failed' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    )}>
                      {doc.status}
                    </span>
                    <button
                      onClick={() => handleDeleteDoc(doc.id, doc.filename)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                      title="Delete document"
                      aria-label="Delete document"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Embedding note */}
        <p className="text-xs text-gray-400 dark:text-gray-600 text-center mt-4">
          Documents are embedded using HuggingFace models and stored in the private Pinecone vector index.
        </p>
      </div>
    </div>
  )
}
