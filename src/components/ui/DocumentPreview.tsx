import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Download, X, FileText, Image, File } from 'lucide-react';

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
  mimeType: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  isOpen,
  onClose,
  documentUrl,
  documentName,
  mimeType,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
    }
  }, [isOpen, documentUrl]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="glass-card p-8 rounded-3xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/60">Loading preview...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="glass-card p-8 rounded-3xl text-center">
            <FileText className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 mb-4">{error}</p>
            <Button onClick={handleDownload} icon={Download}>
              Download to View
            </Button>
          </div>
        </div>
      );
    }

    // Handle different file types
    if (mimeType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center">
          <img
            src={documentUrl}
            alt={documentName}
            className="max-w-full max-h-96 rounded-xl shadow-lg"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError('Failed to load image');
            }}
          />
        </div>
      );
    }

    if (mimeType === 'application/pdf') {
      return (
        <div className="w-full h-96">
          <iframe
            src={`${documentUrl}#toolbar=0`}
            className="w-full h-full rounded-xl"
            title={documentName}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError('Failed to load PDF. Please download to view.');
            }}
          />
        </div>
      );
    }

    // For other file types, show download option
    return (
      <div className="flex items-center justify-center h-96">
        <div className="glass-card p-8 rounded-3xl text-center">
          <File className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">{documentName}</h3>
          <p className="text-white/60 mb-6">Preview not available for this file type</p>
          <Button onClick={handleDownload} icon={Download} glow>
            Download File
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Document Preview" size="xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">{documentName}</h3>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" icon={Download} onClick={handleDownload}>
              Download
            </Button>
            <Button variant="ghost" size="sm" icon={X} onClick={onClose} />
          </div>
        </div>
        
        <div className="glass-card p-4 rounded-xl">
          {renderPreview()}
        </div>
      </div>
    </Modal>
  );
};