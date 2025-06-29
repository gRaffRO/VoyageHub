import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { DocumentPreview } from '../components/ui/DocumentPreview';
import { useDocumentStore } from '../stores/documentStore';
import { useVacationStore } from '../stores/vacationStore';
import { Plus, Search, FileText, Download, Share, Trash2, Upload, File, Image, Calendar, Eye } from 'lucide-react';
import { gsap } from 'gsap';

export const DocumentsPage: React.FC = () => {
  const [selectedVacationId, setSelectedVacationId] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [documentToPreview, setDocumentToPreview] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'other' as const,
    expirationDate: '',
    file: null as File | null,
  });

  const { documents, isLoading, fetchDocuments, uploadDocument, deleteDocument, previewDocument } = useDocumentStore();
  const { vacations, fetchVacations } = useVacationStore();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);

  useEffect(() => {
    if (vacations.length > 0 && !selectedVacationId) {
      setSelectedVacationId(vacations[0].id);
    }
  }, [vacations, selectedVacationId]);

  useEffect(() => {
    if (selectedVacationId) {
      fetchDocuments(selectedVacationId);
    }
  }, [selectedVacationId, fetchDocuments]);

  useEffect(() => {
    if (pageRef.current) {
      const elements = pageRef.current.querySelectorAll('.animate-element');
      gsap.fromTo(elements,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file || !selectedVacationId) return;

    try {
      await uploadDocument(uploadForm.file, {
        vacationId: selectedVacationId,
        title: uploadForm.title,
        type: uploadForm.type,
        expirationDate: uploadForm.expirationDate || undefined,
      });
      
      setUploadForm({
        title: '',
        type: 'other',
        expirationDate: '',
        file: null,
      });
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Failed to upload document:', error);
    }
  };

  const handlePreview = async (document: any) => {
    try {
      const url = await previewDocument(document.id);
      setDocumentToPreview({ ...document, url });
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Failed to preview document:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'passport':
      case 'visa':
        return FileText;
      case 'ticket':
        return File;
      case 'insurance':
        return FileText;
      default:
        return File;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'passport':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'visa':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'ticket':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'insurance':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const isExpiringSoon = (expirationDate?: string) => {
    if (!expirationDate) return false;
    const expiry = new Date(expirationDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (expirationDate?: string) => {
    if (!expirationDate) return false;
    const expiry = new Date(expirationDate);
    const today = new Date();
    return expiry < today;
  };

  if (vacations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96 p-8">
        <div className="text-center glass-card p-8 rounded-3xl">
          <FileText className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No Vacations Found</h3>
          <p className="text-white/60">Create a vacation first to manage its documents</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-8 p-8">
      {/* Header */}
      <div className="animate-element flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
          <p className="text-white/70">
            Securely store and manage your travel documents
          </p>
        </div>
        <Button
          icon={Upload}
          onClick={() => setIsUploadModalOpen(true)}
          glow
          disabled={!selectedVacationId}
        >
          Upload Document
        </Button>
      </div>

      {/* Vacation Selector */}
      <div className="animate-element">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <label className="text-white font-medium">Select Vacation:</label>
              <select
                value={selectedVacationId}
                onChange={(e) => setSelectedVacationId(e.target.value)}
                className="glass-select rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {vacations.map((vacation) => (
                  <option key={vacation.id} value={vacation.id}>
                    {vacation.title}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="animate-element grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Total Documents</p>
                <p className="text-2xl font-bold text-white">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Shared</p>
                <p className="text-2xl font-bold text-white">
                  {documents.filter(d => d.sharedWith.length > 0).length}
                </p>
              </div>
              <Share className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Expiring Soon</p>
                <p className="text-2xl font-bold text-white">
                  {documents.filter(d => isExpiringSoon(d.expirationDate)).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Total Size</p>
                <p className="text-2xl font-bold text-white">
                  {(documents.reduce((sum, d) => sum + d.fileSize, 0) / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <File className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="animate-element flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search documents..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="glass-select rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="all">All Types</option>
            <option value="passport">Passport</option>
            <option value="visa">Visa</option>
            <option value="ticket">Ticket</option>
            <option value="insurance">Insurance</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="animate-element">
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => {
              const IconComponent = getDocumentIcon(document.type);
              const expired = isExpired(document.expirationDate);
              const expiringSoon = isExpiringSoon(document.expirationDate);
              
              return (
                <Card key={document.id} hover className="group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                            {document.title}
                          </h3>
                          <p className="text-sm text-white/60">{document.fileName}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(document.type)}`}>
                        {document.type}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Size:</span>
                        <span className="text-white">{(document.fileSize / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Uploaded:</span>
                        <span className="text-white">{new Date(document.createdAt).toLocaleDateString()}</span>
                      </div>
                      {document.expirationDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Expires:</span>
                          <span className={`${expired ? 'text-red-400' : expiringSoon ? 'text-yellow-400' : 'text-white'}`}>
                            {new Date(document.expirationDate).toLocaleDateString()}
                            {expired && ' (Expired)'}
                            {expiringSoon && !expired && ' (Soon)'}
                          </span>
                        </div>
                      )}
                      {document.sharedWith.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Shared with:</span>
                          <span className="text-white">{document.sharedWith.length} people</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="glass" 
                        size="sm" 
                        icon={Eye} 
                        onClick={() => handlePreview(document)}
                        className="flex-1"
                      >
                        Preview
                      </Button>
                      <Button variant="ghost" size="sm" icon={Download} />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={Trash2} 
                        onClick={() => handleDelete(document.id)}
                        className="text-red-400 hover:text-red-300" 
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto glass-card p-8 rounded-3xl">
              <FileText className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No documents found</h3>
              <p className="text-white/60 mb-6">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Upload your first document to get started'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <Button
                  icon={Upload}
                  onClick={() => setIsUploadModalOpen(true)}
                  glow
                >
                  Upload Document
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Document">
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Document File</label>
            <div className="glass-card border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-white/50 transition-colors cursor-pointer">
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.gif"
                className="hidden"
                id="file-upload"
                required
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-white/60 mx-auto mb-4" />
                <p className="text-white/70 mb-2">
                  {uploadForm.file ? uploadForm.file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-white/50">PDF, JPG, PNG up to 10MB</p>
              </label>
            </div>
          </div>
          
          <Input
            label="Document Title"
            value={uploadForm.title}
            onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
            required
            placeholder="Enter document title"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Document Type</label>
              <select
                value={uploadForm.type}
                onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value as any }))}
                className="glass-select w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="passport">Passport</option>
                <option value="visa">Visa</option>
                <option value="ticket">Ticket</option>
                <option value="insurance">Insurance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Input
              type="date"
              label="Expiration Date (Optional)"
              value={uploadForm.expirationDate}
              onChange={(e) => setUploadForm(prev => ({ ...prev, expirationDate: e.target.value }))}
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsUploadModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" icon={Upload} glow className="flex-1" disabled={isLoading}>
              Upload Document
            </Button>
          </div>
        </form>
      </Modal>

      {/* Document Preview Modal */}
      {documentToPreview && (
        <DocumentPreview
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          documentUrl={documentToPreview.url}
          documentName={documentToPreview.fileName}
          mimeType={documentToPreview.mimeType}
        />
      )}
    </div>
  );
};