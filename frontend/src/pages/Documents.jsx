import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader,
  RefreshCw,
  Trash2,
  FileType,
  FileCode,
  ShieldAlert,
  X,
  Database,
  Layers,
  ArrowUpRight,
} from 'lucide-react'
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

function getFileIcon(filename = '') {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') {
    return <FileType size={16} className="text-rose-500" />
  }
  if (ext === 'docx' || ext === 'doc') {
    return <FileText size={16} className="text-blue-600" />
  }
  if (ext === 'md' || ext === 'txt') {
    return <FileCode size={16} className="text-teal-600" />
  }
  return <FileText size={16} className="text-zinc-400" />
}

function UploadStatus({ upload }) {
  return (
    <div
      className={clsx(
        'p-4 rounded-xl border bg-white dark:bg-[#18181b] transition-all shadow-2xs',
        upload.status === 'done'
          ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20'
          : upload.status === 'error'
          ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50/20'
          : 'border-blue-200 dark:border-blue-900/40'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          {getFileIcon(upload.name)}
          <span className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {upload.name}
          </span>
        </div>
        {upload.status === 'done' && <CheckCircle size={15} className="text-emerald-600" />}
        {upload.status === 'error' && <AlertCircle size={15} className="text-rose-600" />}
        {upload.status === 'uploading' && <Loader size={15} className="text-blue-600 animate-spin" />}
      </div>
      {upload.status === 'uploading' && (
        <>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 mb-2 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${upload.progress}%` }}
            />
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">{upload.stage}</p>
        </>
      )}
      {upload.status === 'done' && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">
          Indexed {upload.result?.chunks} chunks · {upload.result?.ids_created} vector embeddings created
        </p>
      )}
      {upload.status === 'error' && (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-mono">{upload.error}</p>
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
  const [docToDelete, setDocToDelete] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
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

  const confirmDelete = async () => {
    if (!docToDelete) return
    setDeletingId(docToDelete.id)
    try {
      await deleteDocument(docToDelete.id)
      setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id))
      setDocToDelete(null)
    } catch (err) {
      alert(err.message || 'Failed to delete document')
    } finally {
      setDeletingId(null)
    }
  }

  const processFile = useCallback(
    async (file) => {
      const ext = '.' + file.name.split('.').pop().toLowerCase()
      if (!SUPPORTED.includes(ext)) {
        setUploads((prev) => [
          ...prev,
          {
            id: Date.now(),
            name: file.name,
            status: 'error',
            error: `Unsupported file format. Accepted: ${SUPPORTED.join(', ')}`,
          },
        ])
        return
      }

      const id = Date.now() + Math.random()
      const stages = [
        'Uploading document…',
        'Extracting text…',
        'Partitioning semantic chunks…',
        'Generating embeddings…',
        'Writing to Pinecone index…',
      ]
      let stageIdx = 0

      setUploads((prev) => [
        ...prev,
        { id, name: file.name, status: 'uploading', progress: 0, stage: stages[0] },
      ])

      const stageTimer = setInterval(() => {
        stageIdx++
        if (stageIdx < stages.length) {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === id
                ? {
                    ...u,
                    stage: stages[stageIdx],
                    progress: Math.round((stageIdx / stages.length) * 88),
                  }
                : u
            )
          )
        }
      }, 750)

      try {
        const result = await uploadDocument(file)
        clearInterval(stageTimer)
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: 'done', progress: 100, result } : u))
        )
        fetchDocs()
      } catch (err) {
        clearInterval(stageTimer)
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: 'error', error: err.message } : u))
        )
      }
    },
    [fetchDocs]
  )

  const handleFiles = (files) => {
    Array.from(files).forEach(processFile)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const totalChunks = documents.reduce((acc, d) => acc + (d.chunks || 0), 0)

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#fbfbfa] dark:bg-[#111113]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-7">
        {/* Editorial Page Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-1">
            <span>Knowledge Base Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 font-editorial tracking-tight">
            Organizational HR Repository
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed font-sans max-w-2xl">
            Documents stored here are parsed, chunked, and embedded into the private Pinecone vector index for real-time retrieval by Clario.
          </p>
        </div>

        {/* Repository Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Active Documents</span>
            <p className="text-2xl font-bold font-editorial text-zinc-900 dark:text-zinc-100 mt-1">
              {documents.length}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Indexed Chunks</span>
            <p className="text-2xl font-bold font-editorial text-zinc-900 dark:text-zinc-100 mt-1">
              {totalChunks || documents.length * 8}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Vector Store</span>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-2 font-mono flex items-center gap-1.5">
              <Database size={14} /> Pinecone Serverless
            </p>
          </div>
        </div>

        {/* Admin upload requirement note */}
        <div className="mb-6 p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 flex items-start gap-3">
          <AlertCircle size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-sans">
            Document ingestion requires an authenticated Administrator session. If unauthenticated, sign in from the Administration tab before uploading.
          </p>
        </div>

        {/* Upload drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={clsx(
            'border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 mb-6',
            dragging
              ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 scale-[1.005]'
              : 'border-[#d4d4cc] dark:border-[#3f3f46] bg-white dark:bg-[#18181b] hover:border-blue-500 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 shadow-xs'
          )}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md"
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
            aria-label="Upload approved HR documents"
          />
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center mx-auto mb-3 text-blue-600">
            <Upload size={18} />
          </div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1 font-sans">
            Drop approved HR documents here, or <span className="text-blue-600 underline">browse files</span>
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
            Supports PDF, Microsoft Word (.docx), Plain Text (.txt), and Markdown (.md)
          </p>
        </div>

        {/* Active uploads queue */}
        {uploads.length > 0 && (
          <div className="space-y-2.5 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                Upload & Ingestion Pipeline
              </h2>
              <button
                onClick={() => setUploads((prev) => prev.filter((u) => u.status === 'uploading'))}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                Dismiss completed
              </button>
            </div>
            {uploads.map((u) => (
              <UploadStatus key={u.id} upload={u} />
            ))}
          </div>
        )}

        {/* Document list card */}
        <div className="rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#efefea] dark:border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
                Indexed Documents ({documents.length})
              </h2>
            </div>
            <button
              onClick={fetchDocs}
              disabled={loadingDocs}
              className="text-xs text-zinc-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              aria-label="Refresh indexed documents list"
            >
              <RefreshCw size={12} className={clsx(loadingDocs && 'animate-spin')} />
              <span>{loadingDocs ? 'Refreshing…' : 'Refresh'}</span>
            </button>
          </div>

          {docError && (
            <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 text-xs text-rose-700 dark:text-rose-400 flex items-center justify-between border-b border-[#efefea] dark:border-[#27272a]">
              <span>{docError}</span>
              <button onClick={fetchDocs} className="underline hover:no-underline font-medium">
                Retry
              </button>
            </div>
          )}

          {loadingDocs && documents.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
              <Loader size={15} className="animate-spin text-blue-600" />
              Loading indexed repository…
            </div>
          ) : documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents indexed"
              description="Upload company policies and handbook files to build Clario's knowledge repository."
            />
          ) : (
            <div className="divide-y divide-[#efefea] dark:divide-[#27272a]">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-850/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-[#e5e5e0] dark:border-[#27272a] flex items-center justify-center flex-shrink-0">
                      {getFileIcon(doc.filename)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate font-sans">
                        {doc.filename}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {doc.chunks ? `${doc.chunks} chunks · ` : ''}
                        {formatBytes(doc.byte_size)}
                        {doc.created_at ? ` · ${formatDate(doc.created_at)}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span
                      className={clsx(
                        'text-[10px] font-mono font-medium px-2 py-0.5 rounded capitalize border',
                        doc.status === 'ready'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40'
                          : doc.status === 'failed'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/40'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/40'
                      )}
                    >
                      {doc.status}
                    </span>
                    <button
                      onClick={() => setDocToDelete(doc)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Remove document from repository"
                      aria-label="Remove document from repository"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete confirmation modal */}
        {docToDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-sm rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] p-5 shadow-xl space-y-4 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/40 flex items-center justify-center text-rose-600 flex-shrink-0">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
                    Confirm Removal
                  </h3>
                  <p className="text-xs text-zinc-500 font-sans mt-0.5">Vector deletion</p>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                Are you sure you want to remove <span className="font-semibold text-zinc-900 dark:text-zinc-100">{docToDelete.filename}</span>? All indexed vector embeddings will be pruned from Pinecone and Clario will no longer cite this document.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#efefea] dark:border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setDocToDelete(null)}
                  disabled={deletingId !== null}
                  className="px-3 py-1.5 rounded-lg border border-[#e5e5e0] dark:border-[#27272a] text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deletingId !== null}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium disabled:opacity-60 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {deletingId ? <Loader size={12} className="animate-spin" /> : null}
                  {deletingId ? 'Removing…' : 'Remove document'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
