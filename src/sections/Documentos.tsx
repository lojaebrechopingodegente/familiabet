import { useState } from 'react'
import { FolderOpen, Files, AlertTriangle, Upload, FileText, Image, File, Grid, List, Download, Trash2, Eye } from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { DataCard } from '@/components/DataCard'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { SearchInput } from '@/components/SearchInput'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/ToastProvider'
import { useDocuments } from '@/hooks/useDocuments'
import type { Document, DocumentCategory, DocumentType } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const fileTypeIcons: Record<DocumentType, { Icon: typeof FileText; color: string; bg: string }> = {
  pdf: { Icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
  image: { Icon: Image, color: 'text-blue-500', bg: 'bg-blue-50' },
  document: { Icon: File, color: 'text-navy', bg: 'bg-slate-100' },
}

const categoryLabels: Record<DocumentCategory, string> = {
  'plano-saude': 'Plano de Saúde', receitas: 'Receitas Médicas', exames: 'Exames',
  pessoais: 'Documentos Pessoais', legais: 'Documentos Legais', comprovantes: 'Comprovantes', outros: 'Outros',
}

const parentLabels: Record<string, string> = { mother: 'Mãe', father: 'Pai', general: 'Geral' }

export function Documentos() {
  const { data: documents, add, remove } = useDocuments()
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | 'all'>('all')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const [uploadForm, setUploadForm] = useState({
    file_name: '', category: 'plano-saude' as DocumentCategory, parent_id: 'general' as 'mother' | 'father' | 'general',
    expiry_date: '', description: '', file_type: 'document' as DocumentType, file_size: 0,
  })

  const filtered = documents.filter((d) => {
    if (filterCategory !== 'all' && d.category !== filterCategory) return false
    if (!search) return true
    const q = search.toLowerCase()
    return d.file_name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
  })

  const expiringSoon = documents.filter((d) => {
    if (!d.expiry_date) return false
    const days = differenceInDays(parseISO(d.expiry_date), new Date())
    return days >= 0 && days <= 30
  }).length

  const handleUpload = () => {
    if (!uploadForm.file_name) { addToast('warning', 'Nome do arquivo é obrigatório'); return }
    add({
      ...uploadForm,
      file_url: '#',
      uploaded_by: 'João',
      uploaded_at: new Date().toISOString(),
    })
    addToast('success', 'Documento adicionado')
    setUploadOpen(false)
    setUploadForm({ file_name: '', category: 'plano-saude', parent_id: 'general', expiry_date: '', description: '', file_type: 'document', file_size: 0 })
  }

  const handleDelete = () => {
    if (selectedDoc) { remove(selectedDoc.id); addToast('success', 'Documento removido'); setConfirmOpen(false) }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const totalDocs = documents.length
  const lastUpload = documents.length > 0
    ? format(parseISO(documents.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())[0].uploaded_at), 'dd/MM/yyyy')
    : '—'

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FolderOpen className="w-6 h-6 text-navy" />
            <h1 className="text-display text-navy">Repositório de Documentos</h1>
          </div>
          <p className="text-slate-400 text-sm">Gerenciamento de documentos importantes</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="bg-navy hover:bg-navy-light text-white gap-2">
          <Upload className="w-4 h-4" />
          Adicionar Documento
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info-light flex items-center justify-center">
              <Files className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-data text-navy">{totalDocs}</p>
              <p className="text-xs text-slate-400">Total Documentos</p>
            </div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-data text-navy">{expiringSoon}</p>
              <p className="text-xs text-slate-400">Vencendo Este Mês</p>
            </div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-health-light flex items-center justify-center">
              <Upload className="w-5 h-5 text-health" />
            </div>
            <div>
              <p className="text-data text-navy">{lastUpload}</p>
              <p className="text-xs text-slate-400">Último Upload</p>
            </div>
          </div>
        </DataCard>
      </div>

      {/* Search + Filters + View Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar documentos..." className="flex-1 max-w-md" />
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as DocumentCategory | 'all')}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex border border-slate-200 rounded-lg overflow-hidden">
          <button onClick={() => setViewMode('grid')} className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-navy text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}><Grid className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-2 ${viewMode === 'list' ? 'bg-navy text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Category Sidebar + Document Grid */}
      <div className="flex gap-6">
        {/* Category Sidebar */}
        <div className="w-52 shrink-0 space-y-1">
          <button
            onClick={() => setFilterCategory('all')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterCategory === 'all' ? 'bg-navy text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Todos ({documents.length})
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const count = documents.filter((d) => d.category === key).length
            return (
              <button
                key={key}
                onClick={() => setFilterCategory(key as DocumentCategory)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between ${filterCategory === key ? 'bg-navy text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <span>{label}</span>
                <span className={filterCategory === key ? 'text-white/60' : 'text-slate-400'}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* Documents */}
        <div className="flex-1">
          <DataCard>
            {filtered.length === 0 ? (
              <EmptyState icon={<FolderOpen className="w-8 h-8 text-slate-300" />} title="Nenhum documento" description="Adicione o primeiro documento" action={<Button onClick={() => setUploadOpen(true)} variant="outline" className="gap-2"><Upload className="w-4 h-4" />Adicionar</Button>} />
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-4 gap-5">
                {filtered.map((doc) => {
                  const iconInfo = fileTypeIcons[doc.file_type]
                  const Icon = iconInfo.Icon
                  const isExpiring = doc.expiry_date && differenceInDays(parseISO(doc.expiry_date), new Date()) <= 30
                  return (
                    <div
                      key={doc.id}
                      className="bg-white rounded-[10px] shadow-card hover:shadow-card-hover transition-all duration-200 p-5 text-center group cursor-pointer"
                      onClick={() => { setSelectedDoc(doc); setViewerOpen(true) }}
                    >
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-xl ${iconInfo.bg} flex items-center justify-center mx-auto mb-3`}>
                          <Icon className={`w-7 h-7 ${iconInfo.color}`} />
                        </div>
                        {isExpiring && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-warning flex items-center justify-center">
                            <AlertTriangle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-navy truncate mb-1" title={doc.file_name}>{doc.file_name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">{categoryLabels[doc.category]}</p>
                      <div className="flex items-center justify-center gap-2">
                        <StatusBadge variant="neutral" label={parentLabels[doc.parent_id]} size="sm" />
                      </div>
                      {doc.expiry_date && (
                        <p className={`text-[10px] mt-2 ${isExpiring ? 'text-warning font-medium' : 'text-slate-400'}`}>
                          Vence em {format(parseISO(doc.expiry_date), 'dd/MM/yyyy')}
                        </p>
                      )}
                      <div className="flex items-center justify-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); setViewerOpen(true) }} className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-navy"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); addToast('success', 'Download iniciado') }} className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-navy"><Download className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); setConfirmOpen(true) }} className="w-7 h-7 rounded hover:bg-critical-light flex items-center justify-center text-slate-400 hover:text-critical"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map((doc) => {
                  const iconInfo = fileTypeIcons[doc.file_type]
                  const Icon = iconInfo.Icon
                  const isExpiring = doc.expiry_date && differenceInDays(parseISO(doc.expiry_date), new Date()) <= 30
                  return (
                    <div key={doc.id} className="flex items-center gap-4 py-3 px-2 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => { setSelectedDoc(doc); setViewerOpen(true) }}>
                      <div className={`w-10 h-10 rounded-lg ${iconInfo.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${iconInfo.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy truncate">{doc.file_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400">{categoryLabels[doc.category]}</span>
                          <StatusBadge variant="neutral" label={parentLabels[doc.parent_id]} size="sm" />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-400">{formatFileSize(doc.file_size)}</p>
                        <p className="text-[10px] text-slate-400">{format(parseISO(doc.uploaded_at), 'dd/MM/yyyy')}</p>
                      </div>
                      {isExpiring && <AlertTriangle className="w-4 h-4 text-warning shrink-0" />}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); setViewerOpen(true) }} className="w-8 h-8 rounded hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-navy"><Eye className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); setConfirmOpen(true) }} className="w-8 h-8 rounded hover:bg-critical-light flex items-center justify-center text-slate-400 hover:text-critical"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </DataCard>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-heading-1 text-navy">Adicionar Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-slate-300 rounded-xl h-40 flex flex-col items-center justify-center gap-2 hover:border-health transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-slate-400" />
              <p className="text-sm text-slate-500">Clique para selecionar ou arraste o arquivo</p>
              <p className="text-[11px] text-slate-400">PDF, JPG, PNG até 10MB</p>
            </div>
            <div className="space-y-2">
              <Label>Nome do arquivo <span className="text-critical">*</span></Label>
              <Input value={uploadForm.file_name} onChange={(e) => setUploadForm({ ...uploadForm, file_name: e.target.value })} placeholder="Ex: Carteirinha_Plano_Saude.pdf" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={uploadForm.category} onValueChange={(v) => setUploadForm({ ...uploadForm, category: v as DocumentCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={uploadForm.file_type} onValueChange={(v) => setUploadForm({ ...uploadForm, file_type: v as DocumentType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="image">Imagem</SelectItem>
                    <SelectItem value="document">Documento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pertence a</Label>
                <Select value={uploadForm.parent_id} onValueChange={(v) => setUploadForm({ ...uploadForm, parent_id: v as 'mother' | 'father' | 'general' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother">Mãe</SelectItem>
                    <SelectItem value="father">Pai</SelectItem>
                    <SelectItem value="general">Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de vencimento (opcional)</Label>
                <Input type="date" value={uploadForm.expiry_date} onChange={(e) => setUploadForm({ ...uploadForm, expiry_date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} rows={2} placeholder="Informações adicionais..." />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpload} className="bg-navy hover:bg-navy-light text-white" disabled={!uploadForm.file_name}>Adicionar Documento</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedDoc && (
            <>
              <DialogHeader>
                <DialogTitle className="text-heading-1 text-navy flex items-center gap-2">
                  {(() => { const Icon = fileTypeIcons[selectedDoc.file_type].Icon; return <Icon className={`w-5 h-5 ${fileTypeIcons[selectedDoc.file_type].color}`} /> })()}
                  {selectedDoc.file_name}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="bg-slate-50 rounded-xl h-64 flex items-center justify-center mb-4">
                  {(() => { const Icon = fileTypeIcons[selectedDoc.file_type].Icon; return <Icon className={`w-16 h-16 ${fileTypeIcons[selectedDoc.file_type].color} opacity-40`} /> })()}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-400">Categoria:</span> <span className="text-navy font-medium">{categoryLabels[selectedDoc.category]}</span></div>
                  <div><span className="text-slate-400">Pertence a:</span> <span className="text-navy font-medium">{parentLabels[selectedDoc.parent_id]}</span></div>
                  <div><span className="text-slate-400">Tamanho:</span> <span className="text-navy font-medium">{formatFileSize(selectedDoc.file_size)}</span></div>
                  <div><span className="text-slate-400">Upload:</span> <span className="text-navy font-medium">{format(parseISO(selectedDoc.uploaded_at), 'dd/MM/yyyy')}</span></div>
                  <div><span className="text-slate-400">Enviado por:</span> <span className="text-navy font-medium">{selectedDoc.uploaded_by}</span></div>
                  {selectedDoc.expiry_date && (
                    <div><span className="text-slate-400">Vencimento:</span> <span className="text-warning font-medium">{format(parseISO(selectedDoc.expiry_date), 'dd/MM/yyyy')}</span></div>
                  )}
                </div>
                {selectedDoc.description && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">{selectedDoc.description}</div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setViewerOpen(false)}>Fechar</Button>
                <Button variant="destructive" onClick={() => { setViewerOpen(false); setConfirmOpen(true) }}>
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Excluir Documento" description="Tem certeza que deseja excluir este documento?" onConfirm={handleDelete} confirmLabel="Excluir" variant="danger" />
    </div>
  )
}
