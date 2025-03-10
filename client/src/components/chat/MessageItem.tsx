import { useState } from "react";
import { Message } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface MessageItemProps {
  message: Message & { files?: { fileName: string; fileType: string; fileSize: number; fileUrl?: string }[] };
}

export function MessageItem({ message }: MessageItemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  
  const isUserMessage = message.role === "user";
  const messageTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Format the time string from the timestamp
  const formatTime = (timestamp: Date | string) => {
    if (typeof timestamp === 'string') {
      timestamp = new Date(timestamp);
    }
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Message content copied to clipboard successfully",
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({
        title: "Copy failed",
        description: "Could not copy text to clipboard",
        variant: "destructive",
      });
    }
  };
  
  return (
    <motion.div 
      className="flex items-start gap-4 mb-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isUserMessage ? (
        <Avatar className="w-10 h-10 flex-shrink-0">
          {user?.pictureUrl ? (
            <AvatarImage src={user.pictureUrl} alt={user.displayName || "User"} />
          ) : (
            <AvatarFallback className="bg-gray-700 text-gray-300">
              {user?.displayName?.substring(0, 2) || "U"}
            </AvatarFallback>
          )}
        </Avatar>
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
          <i className="ri-robot-2-line text-white"></i>
        </div>
      )}
      
      <div className="flex-1">
        <Card className={`rounded-2xl p-4 shadow-sm ${isUserMessage ? 'bg-gray-800' : 'bg-surface'}`}>
          <ReactMarkdown
            className="text-gray-200 prose prose-invert max-w-none"
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={`bg-gray-900 px-1 py-0.5 rounded text-sm ${className}`} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </Card>
        
        {/* File attachments display */}
        {message.files && message.files.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.files.map((file, index) => (
              <div key={index} className="relative group">
                {file.fileType.startsWith('image/') && file.fileUrl ? (
                  <>
                    <img 
                      src={file.fileUrl} 
                      alt={file.fileName}
                      className="max-w-xs rounded-lg border border-gray-700 hover:border-gray-500 transition-colors cursor-pointer"
                      onClick={() => setImagePreviewUrl(file.fileUrl)}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                      <Button
                        variant="ghost" 
                        size="icon"
                        className="p-2 bg-black/50 rounded-full"
                        onClick={() => setImagePreviewUrl(file.fileUrl)}
                      >
                        <i className="ri-zoom-in-line text-white"></i>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-gray-800/50 rounded-lg flex items-center">
                    <div className="w-10 h-10 bg-gray-700 rounded-md flex-shrink-0 flex items-center justify-center">
                      <i className={`text-lg text-gray-300 ${
                        file.fileType.includes("pdf") ? "ri-file-pdf-line" :
                        file.fileType.includes("word") ? "ri-file-word-line" :
                        file.fileType.includes("excel") ? "ri-file-excel-line" :
                        file.fileType.includes("zip") ? "ri-file-zip-line" :
                        "ri-file-text-line"
                      }`}></i>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{file.fileName}</p>
                      <p className="text-xs text-gray-400">
                        {(file.fileSize / (1024 * 1024)).toFixed(1)} MB · {file.fileType.split("/")[1].toUpperCase()}
                      </p>
                    </div>
                    {file.fileUrl && (
                      <a 
                        href={file.fileUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-gray-700 rounded-lg transition"
                      >
                        <i className="ri-download-line text-gray-400 hover:text-white"></i>
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Message actions and timestamp */}
        {!isUserMessage && (
          <div className="flex items-center gap-2 mt-2 ml-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400 hover:text-white p-1 h-auto"
              onClick={() => copyToClipboard(message.content)}
            >
              <i className="ri-file-copy-line mr-1"></i>
              Copy
            </Button>
            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
          </div>
        )}
        
        {isUserMessage && (
          <div className="text-xs text-gray-500 mt-1.5 ml-2">
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
      
      {/* Image preview dialog */}
      <Dialog open={!!imagePreviewUrl} onOpenChange={() => setImagePreviewUrl(null)}>
        <DialogContent className="max-w-4xl bg-black/90 border-gray-800">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400 hover:text-white"
              onClick={() => setImagePreviewUrl(null)}
            >
              <i className="ri-close-line text-xl"></i>
            </Button>
          </div>
          {imagePreviewUrl && (
            <img 
              src={imagePreviewUrl} 
              alt="Preview" 
              className="max-h-[80vh] max-w-full object-contain mx-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
