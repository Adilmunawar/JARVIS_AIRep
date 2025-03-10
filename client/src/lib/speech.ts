type SpeechCallback = (transcript: string) => void;
type EndCallback = () => void;

let recognition: any = null;

// Initialize speech recognition
function initializeSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn('Speech recognition not supported in this browser');
    return null;
  }
  
  const instance = new SpeechRecognition();
  instance.continuous = true;
  instance.interimResults = true;
  instance.lang = 'en-US';
  
  return instance;
}

// Start speech recognition
export function startSpeechRecognition(onTranscript: SpeechCallback, onEnd: EndCallback) {
  if (!recognition) {
    recognition = initializeSpeechRecognition();
    
    if (!recognition) {
      onEnd();
      return;
    }
  }
  
  let finalTranscript = '';
  
  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
        onTranscript(transcript);
      } else {
        interimTranscript += transcript;
      }
    }
  };
  
  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error);
    onEnd();
  };
  
  recognition.onend = () => {
    onEnd();
  };
  
  try {
    recognition.start();
  } catch (error) {
    console.error('Error starting speech recognition:', error);
    onEnd();
  }
}

// Stop speech recognition and return final transcript
export async function stopSpeechRecognition(): Promise<string> {
  return new Promise((resolve) => {
    if (!recognition) {
      resolve('');
      return;
    }
    
    let finalTranscript = '';
    
    // Store the original onresult handler
    const originalOnResult = recognition.onresult;
    
    // Set a new onresult handler to capture the final transcript
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
    };
    
    // Store the original onend handler
    const originalOnEnd = recognition.onend;
    
    // Set a new onend handler to resolve the promise
    recognition.onend = () => {
      // Restore the original handlers
      recognition.onresult = originalOnResult;
      recognition.onend = originalOnEnd;
      
      resolve(finalTranscript);
    };
    
    try {
      recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      
      // Restore the original handlers
      recognition.onresult = originalOnResult;
      recognition.onend = originalOnEnd;
      
      resolve(finalTranscript);
    }
  });
}
