import React, { useState, useRef, KeyboardEvent, useEffect, useMemo } from 'react';
import { Icons } from '../../constants';
import QuickOptions from './QuickOptions';
import { Message, Persona, PersonaType, PersonSubtype } from '../../types';
import { ttsService } from '../../services/ttsService';

// Browser compatibility
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

const getOptionsForPersona = (persona: Persona): string[] => {
    if (persona.type === PersonaType.PERSON) {
        if (persona.id === 'adaeze-artist') {
            return ["A futuristic Lagos skyline", "An abstract painting of a talking drum", "A serene village scene in the mountains of Obudu", "Zuma Rock at sunset, surrealist style", "A vibrant gele in a modern art style", "Nok terracotta sculpture reimagined"];
        }
        switch (persona.subtype) {
            case PersonSubtype.CURRENT_LEADER:
                return ["What are their key policies?", "Summarize their background.", "What are the latest developments?", "What is their leadership style?", "What are their major achievements?", "What are the biggest challenges they face?"];
            case PersonSubtype.FORMER_LEADER:
                return ["What lessons were learned?", "What is their most significant legacy?", "What advice would you give today's leaders?", "Describe the political climate during their time.", "What was their biggest success?", "What was their greatest challenge?"];
            case PersonSubtype.NOTABLE_PERSON:
                 return ["Tell me about your most famous work.", "What inspired you?", "What is your philosophy?", "How did you get started in your field?", "What impact do you hope to have?", "Who are your influences?"];
            default:
                return [];
        }
    }
    switch (persona.type) {
        case PersonaType.STATE:
            return ["What are some tourist attractions?", "Tell me about the economy.", "What is the culture like?", "List some famous people from here.", "What is the capital city?", "What are the biggest challenges?"];
        case PersonaType.UNIGERIAN:
            return ["Tell me about yourself.", `What is life like in ${persona.subtitle.split(' from ')[1]}?`, "What are your hopes for Nigeria?", "What is a typical day like for you?", "What are some local customs?", "What challenges do you face?"];
        case PersonaType.TOWNHALL:
            return ["Can you explain the new policy?", "What are the arguments for and against?", "How does this affect me?", "What is the historical context?", "Who are the key stakeholders?", "What are the potential economic impacts?"];
        default:
            return ["Tell me more", "Explain that further", "Summarize the key points", "Give me an example"];
    }
}

interface MessageInputProps {
  onSendMessage: (text: string, imageFile: File | null) => void;
  persona: Persona;
  suggestedReplies: string[];
  quotedMessage: Message | null;
  onClearQuote: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, persona, suggestedReplies, quotedMessage, onClearQuote }) => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup object URL
    return () => {
        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
    }
  }, [imagePreviewUrl]);

  useEffect(() => {
    if(quotedMessage && textareaRef.current) {
        textareaRef.current.focus();
    }
  }, [quotedMessage]);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      return;
    }
    
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(prevText => prevText + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    // Cleanup on unmount
    return () => {
        if(recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }
  }, []);
  
  const handleSend = () => {
    if (text.trim() || imageFile) {
      onSendMessage(text.trim(), imageFile);
      setText('');
      setImageFile(null);
      setImagePreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleMicClick = () => {
    if (!isSpeechRecognitionSupported) {
        alert("Speech recognition is not supported in your browser.");
        return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      ttsService.cancel(); // Stop any AI speech before listening
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
  };

  const handleImageAttach = () => {
      fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setImageFile(file);
          if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
          setImagePreviewUrl(URL.createObjectURL(file));
      }
  };

  const handleRemoveImage = () => {
      setImageFile(null);
      setImagePreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
  };
  
  useEffect(() => {
    // Auto-resize textarea
    if(textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text])

  const showSendButton = text.trim().length > 0 || imageFile;
  
  const quickOptions = useMemo(() => {
    if (suggestedReplies && suggestedReplies.length > 0) {
      return suggestedReplies;
    }
    return getOptionsForPersona(persona);
  }, [suggestedReplies, persona]);

  const canAttachImage = persona.type !== PersonaType.TOWNHALL && persona.id !== 'adaeze-artist';

  return (
    <footer className="flex-shrink-0 bg-white dark:bg-dark-primary border-t border-ui-border dark:border-dark-ui-border p-3">
      <QuickOptions onSelect={(t) => onSendMessage(t, null)} options={quickOptions} />
      
       {quotedMessage && quotedMessage.authorInfo && (
           <div className="mb-2 p-3 bg-app-light dark:bg-dark-app-light rounded-lg relative text-sm border-l-4 border-accent-gold">
               <div className="flex justify-between items-center mb-1">
                   <p className="font-semibold text-primary-green">Replying to {quotedMessage.authorInfo.name}</p>
                   <button onClick={onClearQuote} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                       <Icons.XMark className="w-4 h-4 text-secondary dark:text-dark-text-secondary"/>
                   </button>
               </div>
               <p className="text-secondary dark:text-dark-text-secondary truncate">{quotedMessage.text}</p>
           </div>
       )}

       {imagePreviewUrl && (
          <div className="mb-2 p-2 bg-app-light dark:bg-dark-app-light rounded-lg relative w-28">
              <img src={imagePreviewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-md" />
              <button onClick={handleRemoveImage} className="absolute top-0 right-0 -mt-2 -mr-2 bg-primary dark:bg-dark-secondary text-white rounded-full p-0.5 hover:bg-red-500 transition-colors">
                  <Icons.XCircle className="w-5 h-5" />
              </button>
          </div>
      )}

      <div className="flex items-end space-x-3">
        <div className="flex-1 bg-app-light dark:bg-dark-app-light rounded-3xl flex items-center p-1 border-2 border-transparent focus-within:border-primary-green transition-colors">
          {canAttachImage && (
            <>
                <button onClick={handleImageAttach} className="p-2 text-secondary dark:text-dark-text-secondary hover:text-primary-green" disabled={!!imageFile}>
                    <Icons.PaperClip className="w-6 h-6" />
                </button>
                <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </>
          )}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={quotedMessage ? "Write your reply..." : "Type a message..."}
            rows={1}
            className="flex-1 bg-transparent px-3 py-2 resize-none focus:outline-none max-h-40 text-primary dark:text-dark-text-primary placeholder:text-secondary dark:placeholder:text-dark-text-secondary"
          />
        </div>
        <button
          onClick={showSendButton ? handleSend : handleMicClick}
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ease-in-out"
          style={{ 
              backgroundColor: showSendButton ? '#004D25' : (document.documentElement.classList.contains('dark') ? '#1F2937' : '#F0F4F2')
          }}
        >
          {showSendButton ? (
            <Icons.PaperAirplane className="w-6 h-6 text-white" />
          ) : (
            <Icons.Microphone className={`w-6 h-6 text-secondary dark:text-dark-text-secondary transition-colors ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
          )}
        </button>
      </div>
    </footer>
  );
};

export default MessageInput;