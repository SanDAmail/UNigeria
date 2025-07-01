import React, { useState, useEffect, useRef } from 'react';
import { Message, GroundingChunk, Persona, UserProfile } from '../../types';
import { Icons, ALL_PROFILES } from '../../constants';
import MarkdownRenderer from './MarkdownRenderer';
import { useAppDispatch } from '../../context/AppContext';
import { ttsService } from '../../services/ttsService';

interface MessageBubbleProps {
  message: Message;
  persona: Persona;
  onRetry: (messageId: string) => void;
}

const ImageLoader: React.FC = () => (
    <div className="w-64 h-64 bg-gray-200 rounded-lg shimmer"></div>
);

const SourceCitations: React.FC<{ chunks: GroundingChunk[] }> = ({ chunks }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const validChunks = chunks.filter(c => c.web && c.web.uri && c.web.title);
    if (validChunks.length === 0) return null;

    return (
        <div className="mt-3 pt-3 border-t border-primary-green/20">
            <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="w-full flex justify-between items-center text-left text-xs font-semibold text-primary-green mb-2"
            >
                <span className="flex items-center">
                    <Icons.Link className="w-4 h-4 mr-1.5"/>
                    Sources
                </span>
                {isExpanded ? <Icons.ChevronUp className="w-4 h-4" /> : <Icons.ChevronDown className="w-4 h-4" />}
            </button>
            {isExpanded && (
                <ul className="space-y-1.5 animate-fade-in-down">
                    {validChunks.map((chunk, index) => (
                        <li key={index}>
                            <a 
                                href={chunk.web!.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-secondary hover:text-primary-green hover:underline truncate block"
                                title={chunk.web!.title}
                            >
                               {`[${index + 1}] ${chunk.web!.title}`}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, persona, onRetry }) => {
  const dispatch = useAppDispatch();
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  
  const isAiMessage = message.sender === 'ai' || (message.type === 'post' && message.sender !== 'user' && !message.authorInfo?.name.includes('Citizen'));
  
  // This single, robust effect handles typewriter animations for all AI messages.
  // It replaces the two previous useEffect hooks for a more unified logic.
  useEffect(() => {
    clearTimeout(typingTimeoutRef.current);

    if (isAiMessage) {
      // Since MessageBubble components are re-mounted for each new message (due to key={msg.id}),
      // displayedText will start as ''. This logic handles both typing from the start for
      // historic messages and continuing the animation for streaming messages.
      if (displayedText.length < message.text.length) {
        const type = () => {
          setDisplayedText(current => {
            const nextLength = Math.min(current.length + 1, message.text.length);
            const nextText = message.text.substring(0, nextLength);
            
            if (nextText.length < message.text.length) {
              // If not yet finished, schedule the next frame of the animation.
              typingTimeoutRef.current = setTimeout(type, 15);
            }
            
            return nextText;
          });
        };
        typingTimeoutRef.current = setTimeout(type, 15);
      } else {
         // This ensures that if for any reason the text becomes shorter (it shouldn't) or is already complete,
         // we snap to the correct final state.
         setDisplayedText(message.text);
      }
    } else {
      // For user messages, display the text instantly.
      setDisplayedText(message.text);
    }

    return () => clearTimeout(typingTimeoutRef.current);
  }, [message.text, message.id, isAiMessage]); // Depends on message.id to re-trigger for new messages.


  useEffect(() => {
    if (message.isCurrentSearchResult && bubbleRef.current) {
        bubbleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [message.isCurrentSearchResult]);
  
  const handleToggleAudio = () => {
      if(isSpeaking) {
          ttsService.cancel();
          setIsSpeaking(false);
      } else {
          setIsSpeaking(true);
          ttsService.speak(message.text, persona, () => setIsSpeaking(false));
      }
  }

  const handleShare = async () => {
    let textToShare = '';
    const appSignature = "\n\n- Shared from UNigeria";
    if (message.type === 'post' && message.authorInfo) {
         textToShare = `From the UNigeria forums:\n\n${message.authorInfo.name}: "${message.text}"` + appSignature;
    } else if (message.sender === 'user') {
        textToShare = `You: "${message.text}"` + appSignature;
    } else {
         textToShare = `${persona.name}: "${message.text}"` + appSignature;
    }

    try {
        if (navigator.share) {
            await navigator.share({
                title: `UNigeria Chat with ${persona.name}`,
                text: textToShare,
            });
        } else {
            await navigator.clipboard.writeText(textToShare);
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Copied to clipboard!' } });
        }
    } catch (err) {
        console.error('Share/Copy failed:', err);
        try {
          await navigator.clipboard.writeText(textToShare);
          dispatch({ type: 'SHOW_TOAST', payload: { message: 'Copied to clipboard!' } });
        } catch (copyErr) {
          console.error('Fallback copy failed:', copyErr);
          dispatch({ type: 'SHOW_TOAST', payload: { message: 'Sharing failed.', type: 'error' } });
        }
    }
  };

  const handleAuthorClick = () => {
    if (!message.authorInfo) return;

    // Try to find a full profile from constants to include the title
    const foundProfile = ALL_PROFILES.find(p => p.name === message.authorInfo!.name);
    
    const profileToShow: UserProfile = {
        name: message.authorInfo.name,
        avatar: message.authorInfo.avatar,
        title: foundProfile?.title || 'Forum Participant' // Fallback title
    };

    dispatch({ type: 'SHOW_PROFILE_CARD', payload: profileToShow });
  };


  if (message.isThinking) {
    return (
      <div id={`message-${message.id}`} ref={bubbleRef} className={`flex message-bubble-enter justify-start`}>
        <div className={`p-3 max-w-xl relative bg-white border border-ui-border rounded-xl`}>
          <div className="flex items-center justify-center w-6 h-6">
            <span className="text-xl animate-bounce">🤔</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (message.error) {
    const isSenderAi = message.sender === 'ai' || (message.type === 'post' && message.sender !== 'user');
    const errorAlignment = isSenderAi ? 'justify-start' : 'justify-end';
    
    return (
        <div id={`message-${message.id}`} ref={bubbleRef} className={`flex items-center gap-2 group ${errorAlignment}`}>
             <div className={`p-3 max-w-xl relative rounded-xl bg-red-50 border border-red-200 text-red-700 break-words`}>
                <p className="font-semibold text-sm">An error occurred</p>
                <p className="text-xs mt-1 mb-2">{message.error}</p>
                <button 
                    onClick={() => onRetry(message.id)} 
                    className="flex items-center gap-1.5 text-xs font-semibold bg-red-100 hover:bg-red-200 px-2 py-1 rounded-md"
                >
                    <Icons.ArrowPath className="w-3 h-3" />
                    Retry
                </button>
            </div>
        </div>
    );
  }

  const isUser = message.sender === 'user';
  const isForumPost = message.type === 'post';
  const bubbleAlignment = isUser ? 'justify-end' : 'justify-start';

  const actionButtons = (
    <div className="w-8 flex-shrink-0 self-center flex flex-col items-center">
      <button
        onClick={handleShare}
        className="p-1.5 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-app-light hover:text-primary"
        aria-label="Share message"
      >
        <Icons.Share className="w-4 h-4" />
      </button>
      {isAiMessage && !message.isStreaming && (
        <button
            onClick={handleToggleAudio}
            className="p-1.5 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-app-light hover:text-primary"
            aria-label={isSpeaking ? 'Stop audio' : 'Play audio'}
        >
            {isSpeaking ? 
                <Icons.SpeakerXMark className="w-4 h-4 text-red-500" /> : 
                <Icons.SpeakerWave className="w-4 h-4" />
            }
        </button>
      )}
    </div>
  );

  const bubbleClasses = isUser
    ? 'bg-chat-user'
    : 'bg-white border border-ui-border';
  const bubbleShape = 'rounded-xl';
  const searchHighlightClass = message.isCurrentSearchResult ? 'ring-2 ring-accent-gold ring-offset-2 ring-offset-adire-pattern' : '';

  const contentToRender = displayedText;
  const showBlinkingCursor = isAiMessage && displayedText.length < message.text.length;


  let bubbleContent;
  if (isForumPost && message.authorInfo) {
    const postAlignment = isUser ? 'flex-row-reverse' : 'flex-row';
    const originalPostBorder = message.isOriginalPost ? 'border-l-2 border-accent-gold' : '';
    bubbleContent = (
      <div className={`flex items-start gap-3 message-bubble-enter ${isUser ? 'justify-end' : ''}`}>
        <div className={`flex items-start gap-3 ${postAlignment} ${isUser ? '' : originalPostBorder} ${isUser ? 'pr-2' : 'pl-2'}`}>
          <button onClick={handleAuthorClick} className="flex-shrink-0">
            <img src={message.authorInfo.avatar} alt={message.authorInfo.name} className="w-10 h-10 rounded-full mt-2" />
          </button>
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <button onClick={handleAuthorClick} className={`text-sm font-semibold mb-1 ${isUser ? 'text-indigo-600' : 'text-primary-green'}`}>{message.authorInfo.name}</button>
            <div className={`p-3 max-w-lg relative ${bubbleClasses} ${bubbleShape} ${searchHighlightClass} break-words`}>
              {isUser ? <p className="whitespace-pre-wrap">{contentToRender}</p> : <><MarkdownRenderer content={contentToRender} />{showBlinkingCursor && <span className="blinking-cursor">|</span>}</>}
            </div>
          </div>
        </div>
      </div>
    );
  } else if (message.type === 'image') {
      const hasText = message.text && message.text.trim().length > 0;

      bubbleContent = (
        <div className={`flex message-bubble-enter ${bubbleAlignment}`}>
          <div className={`max-w-xl relative ${searchHighlightClass} ${bubbleClasses} rounded-xl break-words`}>
             <div className="relative">
                {message.isLoading ? 
                  <div className="w-64 h-48 bg-gray-200 rounded-lg shimmer"></div> : 
                  message.imageData ? 
                  <img src={message.imageData} alt={message.text || 'Uploaded image'} className="w-full max-h-96 object-cover rounded-t-lg" /> : 
                  <div className="p-2 text-red-500">Image failed to load.</div>
                }
                {message.isLoading && <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}
             </div>
              {hasText && (
                <div className="p-3">
                  <p className="whitespace-pre-wrap">{contentToRender}</p>
                </div>
              )}
          </div>
        </div>
      );
  } else {
    bubbleContent = (
      <div className={`flex message-bubble-enter ${bubbleAlignment}`}>
        <div className={`p-3 max-w-xl relative ${bubbleClasses} ${bubbleShape} ${searchHighlightClass} break-words`}>
          {isUser ? <p className="whitespace-pre-wrap">{contentToRender}</p> : <><MarkdownRenderer content={contentToRender} />{showBlinkingCursor && <span className="blinking-cursor">|</span>}</>}
          {message.groundingChunks && message.groundingChunks.length > 0 && !message.isStreaming && <SourceCitations chunks={message.groundingChunks} />}
        </div>
      </div>
    );
  }
  
  return (
    <div id={`message-${message.id}`} ref={bubbleRef} className={`flex items-start gap-2 group ${bubbleAlignment}`}>
      {!isUser && actionButtons}
      <div className="flex-1 min-w-0">{bubbleContent}</div>
      {isUser && actionButtons}
    </div>
  );
};

export default MessageBubble;