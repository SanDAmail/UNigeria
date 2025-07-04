import React, { useState, useEffect, useRef } from 'react';
import { Message, GroundingChunk, Persona, UserProfile, PersonaType } from '../../types';
import { Icons, ALL_PROFILES } from '../../constants';
import MarkdownRenderer from './MarkdownRenderer';
import { useAppDispatch, useAppState } from '../../context/AppContext';
import { ttsService } from '../../services/ttsService';

interface MessageBubbleProps {
  message: Message;
  persona: Persona;
  onRetry: (messageId: string) => void;
  onQuotePost: (message: Message) => void;
  onDeleteMessage: (message: Message) => Promise<void>;
  onEditPost: (messageId: string, newText: string) => void;
  onLikePost: (messageId: string) => Promise<void>;
}

const ImageLoader: React.FC = () => (
    <div className="w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg shimmer"></div>
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
                                className="text-sm text-secondary dark:text-dark-text-secondary hover:text-primary-green hover:underline truncate block"
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

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, persona, onRetry, onQuotePost, onDeleteMessage, onEditPost, onLikePost }) => {
  const dispatch = useAppDispatch();
  const { userProfile, isAuthenticated } = useAppState();
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);
  const editTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

<<<<<<< HEAD
  const [displayedText, setDisplayedText] = useState('');

  // This effect resets the animation when the message itself is new.
  useEffect(() => {
    setDisplayedText(message.isStreaming ? '' : message.text);
  }, [message.id]);

  // This effect handles the typewriter animation.
  useEffect(() => {
    if (displayedText.length < message.text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText(message.text.substring(0, displayedText.length + 1));
      }, 30); // Typing speed
      return () => clearTimeout(timeoutId);
    }
  }, [displayedText, message.text]);
=======
  const [displayedText, setDisplayedText] = useState('');

  // This effect resets the animation when the message itself is new.
  useEffect(() => {
    setDisplayedText(message.isStreaming ? '' : message.text);
  }, [message.id]);

  // This effect handles the typewriter animation.
  useEffect(() => {
    if (displayedText.length < message.text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText(message.text.substring(0, displayedText.length + 1));
      }, 30); // Typing speed
      return () => clearTimeout(timeoutId);
    }
  }, [displayedText, message.text]);
>>>>>>> master
  
  const isAiMessage = message.sender === 'ai' || (message.type === 'post' && message.sender !== userProfile.id);
  
  useEffect(() => {
    if (message.isCurrentSearchResult && bubbleRef.current) {
        bubbleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [message.isCurrentSearchResult]);

  useEffect(() => {
      if (isEditing && editTextAreaRef.current) {
          editTextAreaRef.current.focus();
          // Auto-resize textarea
          editTextAreaRef.current.style.height = 'auto';
          editTextAreaRef.current.style.height = `${editTextAreaRef.current.scrollHeight}px`;
      }
  }, [isEditing, editedText]);
  
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
         textToShare = `From the UNigeria Town Halls:\n\n${message.authorInfo.name}: "${message.text}"` + appSignature;
    } else if (message.sender === 'user' || message.sender === userProfile.id) {
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
    if (message.type === 'post' && typeof message.sender === 'string' && message.sender !== 'ai' && !message.sender.includes(' ')) {
        dispatch({ type: 'SHOW_SIDEBAR_PROFILE', payload: message.sender });
    }
  };

    const handleSaveEdit = () => {
        if (editedText.trim() === '') return;
        onEditPost(message.id, editedText);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditedText(message.text);
        setIsEditing(false);
    };

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);
        await onLikePost(message.id);
        setIsLiking(false);
    }
    
    const handleDelete = async () => {
        if (isDeleting) return;
        setIsDeleting(true);
        await onDeleteMessage(message);
        // No need to set isDeleting to false as the component will unmount
    }


  if (message.isThinking) {
    return (
      <div id={`message-${message.id}`} ref={bubbleRef} className={`flex message-bubble-enter justify-start`}>
        <div className={`p-3 max-w-xl relative bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-xl`}>
          <div className="flex items-center justify-center w-6 h-6">
            <span className="text-xl animate-bounce">🤔</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (message.error) {
    const isSenderAi = message.sender === 'ai' || (message.type === 'post' && message.sender !== userProfile.id);
    const errorAlignment = isSenderAi ? 'justify-start' : 'justify-end';
    
    return (
        <div id={`message-${message.id}`} ref={bubbleRef} className={`flex items-center gap-2 group ${errorAlignment}`}>
             <div className={`p-3 max-w-xl relative rounded-xl bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 break-words`}>
                <p className="font-semibold text-sm">An error occurred</p>
                <p className="text-xs mt-1 mb-2">{message.error}</p>
                <button 
                    onClick={() => onRetry(message.id)} 
                    className="flex items-center gap-1.5 text-xs font-semibold bg-red-100 dark:bg-red-800/60 hover:bg-red-200 dark:hover:bg-red-700/60 px-2 py-1 rounded-md"
                >
                    <Icons.ArrowPath className="w-3 h-3" />
                    Retry
                </button>
            </div>
        </div>
    );
  }

  const isUser = message.sender === 'user' || message.sender === userProfile.id;
  const isTownHallPost = message.type === 'post';
  const bubbleAlignment = isUser ? 'justify-end' : 'justify-start';
  const canEdit = isAuthenticated && isTownHallPost && message.sender === userProfile.id;
  const canDelete = isAuthenticated && isUser;

  const hasLiked = isAuthenticated && userProfile.id ? message.likes?.includes(userProfile.id) : false;
  const likeCount = message.likes?.length || 0;

  const bubbleClasses = isUser
    ? 'bg-chat-user dark:bg-dark-chat-user'
    : 'bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border';
  const bubbleShape = 'rounded-xl';
  const searchHighlightClass = message.isCurrentSearchResult ? 'ring-2 ring-accent-gold ring-offset-2 ring-offset-adire-pattern dark:ring-offset-dark-primary' : '';

  const contentToRender = displayedText;
<<<<<<< HEAD
  const showBlinkingCursor = isAiMessage && message.isStreaming && displayedText.length < message.text.length;
=======
  const showBlinkingCursor = isAiMessage && message.isStreaming && displayedText.length < message.text.length;
>>>>>>> master


  let bubbleContent;
  if (isTownHallPost && message.authorInfo) {
    const postAlignment = isUser ? 'flex-row-reverse' : 'flex-row';
    const originalPostBorder = message.isOriginalPost ? 'border-l-2 border-accent-gold' : '';
    bubbleContent = (
      <div className={`flex items-start gap-3 message-bubble-enter ${isUser ? 'justify-end' : ''}`}>
        <div className={`flex items-start gap-3 ${postAlignment} ${isUser ? '' : originalPostBorder} ${isUser ? 'pr-2' : 'pl-2'}`}>
          <button onClick={handleAuthorClick} className="flex-shrink-0">
            <img src={message.authorInfo.avatar} alt={message.authorInfo.name} className="w-10 h-10 rounded-full mt-2" />
          </button>
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-2 mb-1 ${isUser ? 'flex-row-reverse' : ''}`}>
                <button onClick={handleAuthorClick} className={`text-sm font-semibold ${isUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-primary-green'}`}>{message.authorInfo.name}</button>
                {message.updated_at && <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>}
            </div>
            <div className={`p-3 max-w-lg relative ${bubbleClasses} ${bubbleShape} ${searchHighlightClass} break-words`}>
              {isEditing ? (
                  <div className='w-full'>
                      <textarea
                          ref={editTextAreaRef}
                          value={editedText}
                          onChange={(e) => {
                              setEditedText(e.target.value);
                              e.target.style.height = 'auto';
                              e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          className="w-full bg-white dark:bg-dark-app-light border border-ui-border dark:border-dark-ui-border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-green transition resize-none text-primary dark:text-dark-text-primary"
                      />
                      <div className="flex justify-end items-center gap-2 mt-2">
                          <button onClick={handleCancelEdit} className="text-xs font-semibold text-secondary dark:text-dark-text-secondary hover:underline">Cancel</button>
                          <button onClick={handleSaveEdit} className="text-xs font-semibold bg-primary-green text-white px-3 py-1 rounded-md hover:bg-opacity-90">Save</button>
                      </div>
                  </div>
              ) : (
                  <>
                    <MarkdownRenderer content={contentToRender} />
<<<<<<< HEAD
                    {showBlinkingCursor && <Icons.Pencil className="w-4 h-4 inline-block ml-1 blinking-cursor text-primary-green" />}
=======
                    {showBlinkingCursor && <Icons.Pencil className="w-4 h-4 inline-block ml-1 blinking-cursor text-primary-green" />}
>>>>>>> master
                  </>
              )}
               {likeCount > 0 && !isEditing && (
                    <div className="absolute -bottom-3 right-3 flex items-center bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-full px-1.5 py-0.5 shadow-sm">
                        <Icons.Heart className="w-3.5 h-3.5 text-red-500"/>
                        <span className="text-xs text-secondary dark:text-dark-text-secondary font-semibold ml-1">{likeCount}</span>
                    </div>
                )}
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
                  <div className="w-64 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg shimmer"></div> : 
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
<<<<<<< HEAD
          {isUser ? <p className="whitespace-pre-wrap">{contentToRender}</p> : <><MarkdownRenderer content={contentToRender} />{showBlinkingCursor && <Icons.Pencil className="w-4 h-4 inline-block ml-1 blinking-cursor text-primary-green" />}</>}
=======
          {isUser ? <p className="whitespace-pre-wrap">{contentToRender}</p> : <><MarkdownRenderer content={contentToRender} />{showBlinkingCursor && <Icons.Pencil className="w-4 h-4 inline-block ml-1 blinking-cursor text-primary-green" />}</>}
>>>>>>> master
          {message.groundingChunks && message.groundingChunks.length > 0 && !message.isStreaming && <SourceCitations chunks={message.groundingChunks} />}
        </div>
      </div>
    );
  }
  
  const messageActions = (
    <div className="absolute -bottom-4 left-0 flex items-center bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-0.5 space-x-0.5">
        {isTownHallPost && (
            <button
                onClick={handleLike}
                disabled={!isAuthenticated || isLiking}
                title={hasLiked ? 'Unlike' : 'Like'}
                className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 disabled:cursor-not-allowed group/like"
            >
                {isLiking ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-green"></div> : <Icons.Heart className={`w-4 h-4 transition-colors ${hasLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 group-hover/like:text-red-500'}`} />}
            </button>
        )}
        {isTownHallPost && (
             <button 
                onClick={() => onQuotePost(message)} 
                title="Quote"
                className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-app-light dark:hover:bg-dark-app-light hover:text-primary dark:hover:text-dark-text-primary"
            >
                <Icons.ChatBubbleLeftRight className="w-4 h-4" />
            </button>
        )}
        {canEdit && (
            <button 
                onClick={() => setIsEditing(true)} 
                title="Edit"
                className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-app-light dark:hover:bg-dark-app-light hover:text-primary dark:hover:text-dark-text-primary"
            >
                <Icons.Pencil className="w-4 h-4" />
            </button>
        )}
        {canDelete && (
            <button 
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete"
                className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400"
            >
                {isDeleting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div> : <Icons.Trash className="w-4 h-4" />}
            </button>
        )}
    </div>
  );

  return (
    <div id={`message-${message.id}`} ref={bubbleRef} className={`flex items-start gap-2 group ${bubbleAlignment}`}>
      {!isUser && isTownHallPost && <div className="w-8 flex-shrink-0"></div>}
      <div className="flex-1 min-w-0 relative">
        {bubbleContent}
        {(isTownHallPost || canDelete) && !isEditing && messageActions}
      </div>
    </div>
  );
};

export default MessageBubble;