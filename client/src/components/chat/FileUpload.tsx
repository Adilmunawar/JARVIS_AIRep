import React, { useRef, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  children: React.ReactNode;
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
}

export function FileUpload({
  children,
  onFilesSelected,
  accept = "image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  multiple = true,
  maxSize = 10, // 10MB default max size
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    
    const filesArray = Array.from(fileList);
    const validFiles = validateFiles(filesArray);
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
    
    // Reset the input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const maxSizeBytes = maxSize * 1024 * 1024;
    
    files.forEach(file => {
      if (file.size > maxSizeBytes) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the maximum size of ${maxSize}MB.`,
          variant: "destructive"
        });
        return;
      }
      
      validFiles.push(file);
    });
    
    return validFiles;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(filesArray);
      
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onClick: () => {
          if (child.props.onClick) {
            child.props.onClick();
          }
          triggerFileInput();
        },
        className: `${child.props.className || ''} ${isDragging ? 'ring-2 ring-primary' : ''}`
      });
    }
    return child;
  });

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
      />
      {childrenWithProps}
    </div>
  );
}
