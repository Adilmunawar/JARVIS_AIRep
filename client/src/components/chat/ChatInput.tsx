import { useState, useRef, FormEvent } from "react";
import { useChat } from "@/hooks/use-chat";
import { FileUpload } from "./FileUpload";
import { Button } from "@/components/ui/button";
import { startSpeechRecognition, stopSpeechRecognition } from "@/lib/speech";
import { ModelSelector } from "./ModelSelector";
import { motion, AnimatePresence } from "framer-motion";

type UploadedFile = {
  file: File;
  preview: string;
  type: string;
};

export function ChatInput() {
  const { sendMessage, isSending } = useChat();
  const [message, setMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [currentModel, setCurrentModel] = useState("gpt-4o");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && uploadedFiles.length === 0) return;
    
    try {
      await sendMessage(message, uploadedFiles.map(uf => uf.file), currentModel);
      setMessage("");
      setUploadedFiles([]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileUpload = (files: File[]) => {
    const newUploadedFiles = files.map(file => {
      const isImage = file.type.startsWith("image/");
      return {
        file,
        preview: isImage ? URL.createObjectURL(file) : "",
        type: file.type
      };
    });
    
    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
    setIsExpanded(true);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(files => {
      const newFiles = [...files];
      const removed = newFiles.splice(index, 1)[0];
      
      // Revoke object URL if it's an image
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      
      if (newFiles.length === 0) {
        setIsExpanded(false);
      }
      
      return newFiles;
    });
  };

  const toggleSpeechRecognition = async () => {
    if (isListening) {
      const transcript = await stopSpeechRecognition();
      setMessage(prev => prev + " " + transcript);
      setIsListening(false);
    } else {
      setIsListening(true);
      startSpeechRecognition((transcript) => {
        setMessage(prev => prev + " " + transcript);
      }, () => {
        setIsListening(false);
      });
    }
  };

  const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <motion.div 
      className="border-t border-gray-800 glass-effect p-3 md:p-4 w-full"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-4xl mx-auto">
        <form className="relative" onSubmit={handleSendMessage}>
          <div className="flex flex-col gap-2">
            {/* Model selector and options row */}
            <div className="flex items-center justify-between px-2">
              <ModelSelector 
                onModelChange={setCurrentModel} 
                currentModel={currentModel} 
              />
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <i className="ri-settings-3-line"></i>
                  <span>Options</span>
                  <motion.i 
                    className="ri-arrow-down-s-line" 
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </Button>
              </div>
            </div>
            
            {/* Input row */}
            <motion.div 
              className="flex items-center bg-gray-800/70 backdrop-blur-md rounded-xl px-3 py-2 transition-all"
              layout
            >
              <FileUpload onFilesSelected={handleFileUpload}>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition text-gray-400 hover:text-white btn-pulse"
                >
                  <i className="ri-attachment-2-line"></i>
                </Button>
              </FileUpload>
              
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Message JARVIS..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-transparent border-0 focus:outline-none text-gray-200 placeholder-gray-500 px-3 py-2"
                disabled={isSending}
              />
              
              <div className="flex items-center gap-1">
                {speechRecognitionSupported && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleSpeechRecognition}
                    className={`p-2 rounded-lg hover:bg-gray-700/50 transition btn-pulse ${isListening ? 'text-primary animate-pulse' : 'text-gray-400 hover:text-white'}`}
                    disabled={isSending}
                  >
                    <i className="ri-mic-line"></i>
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  variant="default"
                  size="icon"
                  className="p-2 rounded-lg bg-primary hover:bg-primary/90 transition text-white animate-glow"
                  disabled={isSending}
                >
                  {isSending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <i className="ri-send-plane-fill"></i>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
          
          {/* Extra options */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 bg-gray-800/30 backdrop-blur-md rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full bg-gray-700/50 text-xs px-3 py-1 h-auto hover:bg-gray-700"
                    >
                      <i className="ri-image-line mr-1.5"></i>
                      Generate image
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full bg-gray-700/50 text-xs px-3 py-1 h-auto hover:bg-gray-700"
                    >
                      <i className="ri-translate-2 mr-1.5"></i>
                      Translate
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full bg-gray-700/50 text-xs px-3 py-1 h-auto hover:bg-gray-700"
                    >
                      <i className="ri-code-box-line mr-1.5"></i>
                      Code assistant
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* File Preview Section */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div 
                className="mt-2 space-y-2"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {uploadedFiles.map((file, index) => (
                  <motion.div 
                    key={index} 
                    className="p-3 glass-card rounded-lg flex items-center"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-12 h-12 bg-gray-700 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {file.type.startsWith("image/") && file.preview ? (
                        <img 
                          src={file.preview} 
                          alt={file.file.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className={`text-xl text-gray-300 ${
                          file.type.includes("pdf") ? "ri-file-pdf-line" :
                          file.type.includes("word") ? "ri-file-word-line" :
                          file.type.includes("excel") ? "ri-file-excel-line" :
                          file.type.includes("zip") ? "ri-file-zip-line" :
                          "ri-file-text-line"
                        }`}></i>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{file.file.name}</p>
                      <p className="text-xs text-gray-400">
                        {(file.file.size / 1024 / 1024).toFixed(1)} MB · {file.file.type.split("/")[1].toUpperCase()}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost" 
                      size="icon"
                      className="p-1.5 hover:bg-gray-700 rounded-full transition"
                      onClick={() => removeFile(index)}
                      aria-label="Remove file"
                    >
                      <i className="ri-close-line text-gray-400 hover:text-white"></i>
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-3 text-xs text-gray-500 text-center">
            JARVIS may produce inaccurate information about people, places, or facts.
            <a href="#" className="text-primary hover:underline ml-1">Terms & Privacy Policy</a>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
