import { useState, useRef, FormEvent } from "react";
import { useChat } from "@/hooks/use-chat";
import { FileUpload } from "./FileUpload";
import { Button } from "@/components/ui/button";
import { startSpeechRecognition, stopSpeechRecognition } from "@/lib/speech";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && uploadedFiles.length === 0) return;
    
    try {
      await sendMessage(message, uploadedFiles.map(uf => uf.file));
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
  };

  const removeFile = (index: number) => {
    setUploadedFiles(files => {
      const newFiles = [...files];
      const removed = newFiles.splice(index, 1)[0];
      
      // Revoke object URL if it's an image
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
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
    <div className="border-t border-gray-800 bg-surface p-3 md:p-4 w-full">
      <div className="max-w-4xl mx-auto">
        <form className="relative" onSubmit={handleSendMessage}>
          <div className="flex items-center bg-gray-800/70 rounded-xl px-3 py-2">
            <FileUpload onFilesSelected={handleFileUpload}>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                className="p-2 rounded-lg hover:bg-gray-700/50 transition text-gray-400 hover:text-white"
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
                  className={`p-2 rounded-lg hover:bg-gray-700/50 transition ${isListening ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                  disabled={isSending}
                >
                  <i className="ri-mic-line"></i>
                </Button>
              )}
              
              <Button 
                type="submit" 
                variant="default"
                size="icon"
                className="p-2 rounded-lg bg-primary hover:bg-primary/90 transition text-white"
                disabled={isSending}
              >
                {isSending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <i className="ri-send-plane-fill"></i>
                )}
              </Button>
            </div>
          </div>
          
          {/* File Preview Section */}
          {uploadedFiles.length > 0 && (
            <div className="mt-2 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="p-3 bg-gray-800/50 rounded-lg flex items-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-md flex-shrink-0 flex items-center justify-center">
                    {file.type.startsWith("image/") && file.preview ? (
                      <img 
                        src={file.preview} 
                        alt={file.file.name} 
                        className="w-12 h-12 object-cover rounded-md"
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
                    className="p-1.5 hover:bg-gray-700 rounded-lg transition"
                    onClick={() => removeFile(index)}
                    aria-label="Remove file"
                  >
                    <i className="ri-close-line text-gray-400 hover:text-white"></i>
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-3 text-xs text-gray-500 text-center">
            JARVIS may produce inaccurate information about people, places, or facts.
            <a href="#" className="text-primary hover:underline ml-1">Terms & Privacy Policy</a>
          </div>
        </form>
      </div>
    </div>
  );
}
