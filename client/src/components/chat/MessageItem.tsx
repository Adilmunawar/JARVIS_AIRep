import { useState, useRef, useEffect } from "react";
import { Message } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SiOpenai, SiGoogle } from 'react-icons/si';

interface MessageItemProps {
  message: Message & { files?: { fileName: string; fileType: string; fileSize: number; fileUrl?: string }[] };
}

export function MessageItem({ message }: MessageItemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isContentTruncated, setIsContentTruncated] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const isUserMessage = message.role === "user";
  const messageTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Detect if content is too long and should be truncated
  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement && !isUserMessage && !showFullContent) {
      // Content is considered truncated if it's more than 500px in height
      setIsContentTruncated(contentElement.scrollHeight > 500);
    }
  }, [message.content, isUserMessage, showFullContent]);
  
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

  // Parse and use metadata if available
  const getMetadata = () => {
    if (!message.metadata) return { model: 'gpt-4o' };
    try {
      return JSON.parse(message.metadata);
    } catch (e) {
      return { model: 'gpt-4o' };
    }
  };
  
  const metadata = getMetadata();
  
  // Determine which AI model icon to show based on message metadata
  const getModelIcon = () => {
    const modelId = metadata.model || 'gpt-4o';
    
    if (modelId.includes('gemini')) {
      return <SiGoogle className="text-blue-400" size={12} />;
    } else {
      return <SiOpenai className="text-green-400" size={12} />;
    }
  };
  
  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: { 
      scale: 1.01,
      transition: { duration: 0.2 }
    }
  };

  // Animation variants for message actions
  const actionsVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  };
  
  return (
    <motion.div 
      className="flex items-start gap-4 mb-8 relative"
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={containerVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      {/* Avatar or bot icon with animation */}
      <motion.div 
        className="flex-shrink-0"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        {isUserMessage ? (
          <Avatar className="w-10 h-10">
            {user?.pictureUrl ? (
              <AvatarImage src={user.pictureUrl} alt={user.displayName || "User"} />
            ) : (
              <AvatarFallback className="bg-gray-700 text-gray-300">
                {user?.displayName?.substring(0, 2) || "U"}
              </AvatarFallback>
            )}
          </Avatar>
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center relative">
            <div className={`absolute inset-0 rounded-full bg-primary/30 ${isHovered ? 'animate-expand-radial' : ''}`}></div>
            <i className="ri-robot-2-line text-white relative z-10"></i>
          </div>
        )}
      </motion.div>
      
      <div className="flex-1 min-w-0">
        {/* Message metadata bar */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-300">
            {isUserMessage ? user?.displayName || "You" : "JARVIS"}
          </span>
          
          {!isUserMessage && (
            <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-0.5 rounded-full text-xs text-gray-400">
              {getModelIcon()}
              <span className="ml-1">{message.metadata?.model || 'gpt-4o'}</span>
            </div>
          )}
          
          <span className="text-xs text-gray-500 ml-auto">
            {formatTime(message.timestamp)}
          </span>
        </div>
        
        {/* Message content */}
        <div 
          className={`relative rounded-2xl shadow-lg overflow-hidden ${
            isUserMessage ? 'glass-card bg-primary/10' : 'glass-effect'
          } ${showFullContent ? '' : 'max-h-[500px]'}`}
        >
          <Card 
            className={`rounded-2xl p-4 border-0 bg-transparent`}
            ref={contentRef}
          >
            <ReactMarkdown
              className="text-gray-200 prose prose-invert max-w-none"
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="relative group">
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full bg-gray-800/80 hover:bg-gray-700"
                          onClick={() => copyToClipboard(String(children))}
                        >
                          <i className="ri-file-copy-line text-xs"></i>
                        </Button>
                      </div>
                      <SyntaxHighlighter
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                        wrapLines={true}
                        showLineNumbers={true}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
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
          
          {/* Gradient fade for long content */}
          {isContentTruncated && !showFullContent && (
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900/90 to-transparent pointer-events-none"></div>
          )}
        </div>
        
        {/* Show more button for long content */}
        {isContentTruncated && (
          <div className="flex justify-center mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400 hover:text-white gap-1"
              onClick={() => setShowFullContent(!showFullContent)}
            >
              {showFullContent ? (
                <>
                  <i className="ri-arrow-up-s-line"></i>
                  Show less
                </>
              ) : (
                <>
                  <i className="ri-arrow-down-s-line"></i>
                  Show more
                </>
              )}
            </Button>
          </div>
        )}
        
        {/* File attachments display with animations */}
        <AnimatePresence>
          {message.files && message.files.length > 0 && (
            <motion.div 
              className="mt-3 space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {message.files.map((file, index) => (
                <motion.div 
                  key={index} 
                  className="relative group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {file.fileType.startsWith('image/') && file.fileUrl ? (
                    <>
                      <div className="overflow-hidden rounded-lg border border-gray-700 hover:border-primary/50 transition-colors">
                        <motion.img 
                          src={file.fileUrl} 
                          alt={file.fileName}
                          className="max-w-xs object-cover cursor-pointer transition-transform"
                          onClick={() => setImagePreviewUrl(file.fileUrl)}
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                        <Button
                          variant="ghost" 
                          size="icon"
                          className="p-2 bg-black/60 rounded-full animate-glow"
                          onClick={() => setImagePreviewUrl(file.fileUrl)}
                        >
                          <i className="ri-zoom-in-line text-white"></i>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <motion.div 
                      className="p-3 glass-card rounded-lg flex items-center"
                      whileHover={{ 
                        boxShadow: "0 0 0 1px rgba(var(--primary), 0.3)", 
                        y: -2
                      }}
                    >
                      <div className="w-12 h-12 bg-gray-800 rounded-md flex-shrink-0 flex items-center justify-center">
                        <i className={`text-xl text-gray-300 ${
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
                        <motion.a 
                          href={file.fileUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-700 rounded-full transition flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <i className="ri-download-line text-primary"></i>
                        </motion.a>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Message actions with hover animation */}
        {!isUserMessage && (
          <div 
            className="mt-2"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
          >
            <AnimatePresence>
              {(isHovered || showActions) && (
                <motion.div 
                  className="flex items-center gap-2 ml-1"
                  variants={actionsVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-400 hover:text-white p-1.5 h-auto rounded-full hover:bg-gray-800"
                    onClick={() => copyToClipboard(message.content)}
                  >
                    <i className="ri-file-copy-line mr-1.5"></i>
                    Copy
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-400 hover:text-white p-1.5 h-auto rounded-full hover:bg-gray-800"
                  >
                    <i className="ri-sound-module-line mr-1.5"></i>
                    Read aloud
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-400 hover:text-white p-1.5 h-auto rounded-full hover:bg-gray-800"
                  >
                    <i className="ri-share-line mr-1.5"></i>
                    Share
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {/* Image preview dialog with animation */}
      <Dialog open={!!imagePreviewUrl} onOpenChange={() => setImagePreviewUrl(null)}>
        <DialogContent className="max-w-5xl bg-black/95 border-gray-800">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-400">Image Preview</div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-800"
              onClick={() => setImagePreviewUrl(null)}
            >
              <i className="ri-close-line"></i>
            </Button>
          </div>
          
          {imagePreviewUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 15 }}
              className="relative"
            >
              <img 
                src={imagePreviewUrl} 
                alt="Preview" 
                className="max-h-[70vh] max-w-full object-contain mx-auto rounded-lg"
              />
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/60 hover:bg-black/80 text-white rounded-full"
                >
                  <i className="ri-download-line mr-1.5"></i>
                  Download
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/60 hover:bg-black/80 text-white rounded-full"
                >
                  <i className="ri-zoom-in-line mr-1.5"></i>
                  Zoom
                </Button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
