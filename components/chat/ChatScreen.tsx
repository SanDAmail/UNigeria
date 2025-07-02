import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Persona, PersonaType, Message, GroundingChunk } from '../../types';
import { getChatSessionPersona } from '../../personas/personas';
import ChatHeader from './ChatHeader';
import MessageArea from './MessageArea';
import MessageInput from './MessageInput';
import { getChatHistory, addMessage, clearChatHistory, incrementReplyCount, deleteTownHallPost, deleteDirectMessage, updateMessageContent, toggleLikePost } from '../../services/dbService';
import { generateStreamingResponse, generateImageResponse } from '../../services/geminiService';
import { townHallService } from '../../services/townHallService';
import { ttsService } from '../../services/ttsService';
import { INITIAL_CHAT_HISTORY, Icons } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/AppContext';
import { supabase } from '../../services/supabaseService';

// --- Skeleton Loader Component ---
const SkeletonBubble: React.FC<{ align: 'left' | 'right', width: string }> = ({ align, width }) => (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        <div className={`shimmer rounded-xl p-3 ${width}`} style={{height: '48px'}}></div>
    </div>
);

const ChatScreenSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-dark-primary">
            {/* Header */}
            <header className="flex-shrink-0 bg-white dark:bg-dark-primary border-b border-ui-border dark:border-dark-ui-border p-3 flex items-center justify-between z-10">
                <div className="flex items-center space-x-3">
                    <button className="lg:hidden p-1 text-secondary opacity-50">
                        <Icons.ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="shimmer w-10 h-10 rounded-full"></div>
                    <div>
                        <div className="shimmer h-4 w-32 rounded mb-1"></div>
                        <div className="shimmer h-3 w-40 rounded"></div>
                    </div>
                </div>
                <div className="shimmer w-6 h-6 rounded-full"></div>
            </header>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-adire-pattern">
                <SkeletonBubble align="left" width="w-3/5" />
                <SkeletonBubble align="right" width="w-1/2" />
                <SkeletonBubble align="left" width="w-4/6" />
                <SkeletonBubble align="right" width="w-2/5" />
            </div>

            {/* Message Input */}
            <footer className="flex-shrink-0 bg-white dark:bg-dark-primary border-t border-ui-border dark:border-dark-ui-border p-3">
                <div className="flex space-x-2 mb-2 overflow-x-auto pb-2">
                    <div className="shimmer h-8 w-40 rounded-full"></div>
                    <div className="shimmer h-8 w-48 rounded-full"></div>
                </div>
                <div className="flex items-end space-x-3">
                    <div className="flex-1 shimmer rounded-3xl h-12"></div>
                    <div className="w-12 h-12 shimmer rounded-full flex-shrink-0"></div>
                </div>
            </footer>
        </div>
    );
};
// --- End Skeleton ---

const AssistantInfoBanner: React.FC<{ personaName: string, onDismiss: () => void }> = ({ personaName, onDismiss }) => (
    <div className="bg-primary-green/10 dark:bg-primary-green/20 text-primary-green dark:text-green-300 p-3 text-sm flex items-start justify-between gap-3 animate-fade-in-down">
        <Icons.InformationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="flex-1">
            You are chatting with the AI assistant for <span className="font-bold">{personaName}</span>. Your messages will be delivered, and they will respond when available.
        </p>
        <button onClick={onDismiss} className="p-1 -m-1 rounded-full hover:bg-primary-green/20">
            <Icons.XMark className="w-5 h-5" />
        </button>
    </div>
);


interface ChatScreenProps {
  personaType: PersonaType;
  personaId: string;
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
}

const ChatScreen: React.FC<ChatScreenProps> = ({ personaType, personaId }) => {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [quotedMessage, setQuotedMessage] = useState<Message | null>(null);
  const [showAssistantBanner, setShowAssistantBanner] = useState(false);
  const { userProfile, isAuthenticated, reports, townHallCategories } = useAppState();
  const dispatch = useAppDispatch();
  const chatId = personaType === PersonaType.TOWNHALL ? `townhall_${personaId}` : `${personaType}_${personaId}`;

  // In-Chat Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);

  const updateChatListDetail = useCallback((message: Message) => {
    dispatch({
      type: 'UPDATE_CHAT_LIST_DETAIL',
      payload: {
        chatId: chatId,
        detail: { lastMessage: message.error ? '[Error]' : message.type === 'image' ? `[Image] ${message.text}`.trim() : message.text, timestamp: message.timestamp }
      }
    });
  }, [chatId, dispatch]);

  const handleTownHallResponse = useCallback(async (p: Persona, history: Message[], prompt: string, isInitialPost: boolean) => {
    const thinkingMessage: Message = {
      id: `msg_thinking_${Date.now()}`,
      text: 'The moderator is gathering viewpoints...',
      sender: 'ai',
      timestamp: Date.now(),
      isStreaming: true,
      authorInfo: { name: p.name, avatar: p.avatar },
      type: 'post'
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      let newPosts: Message[] = [];
      if (isInitialPost) {
        const initialDiscussion = await townHallService.generateInitialDiscussion(p, history, prompt);
        newPosts = initialDiscussion.map((item, index) => {
          const speakerAvatar = `https://picsum.photos/seed/${item.speaker.replace(/\s/g, '')}/40/40`;
          return {
            id: `post_${Date.now() + index}`,
            text: item.text,
            sender: item.speaker,
            timestamp: Date.now() + index,
            type: 'post',
            authorInfo: { name: item.speaker, avatar: speakerAvatar },
          };
        });
      } else {
        const reply = await townHallService.generateReply(p, history, prompt);
        const speakerAvatar = `https://picsum.photos/seed/${reply.speaker.replace(/\s/g, '')}/40/40`;
        newPosts.push({
          id: `post_${Date.now()}`,
          text: reply.text,
          sender: reply.speaker,
          timestamp: Date.now(),
          type: 'post',
          authorInfo: { name: reply.speaker, avatar: speakerAvatar },
        });
      }

      setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id)); // remove thinking
      setMessages(prev => [...prev, ...newPosts]);
      
      for (const post of newPosts) {
          await addMessage(chatId, post);
          await incrementReplyCount(personaId); 
          dispatch({ type: 'INCREMENT_REPLY_COUNT', payload: { reportId: personaId } });
      }

      if(newPosts.length > 0) {
        updateChatListDetail(newPosts[newPosts.length-1]);
      }
        
    } catch (error) {
      console.error("Town Hall response failed:", error);
      dispatch({ type: 'SHOW_TOAST', payload: { message: (error as Error).message, type: 'error' } });
      const errorPost: Message = {
        id: `post_error_${Date.now()}`, text: '', sender: p.name, timestamp: Date.now(),
        type: 'post', authorInfo: { name: p.name, avatar: p.avatar },
        error: (error as Error).message || 'Failed to generate discussion.',
      };
      setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id).concat(errorPost));
      await addMessage(chatId, errorPost);
      updateChatListDetail(errorPost);
    }
  }, [chatId, dispatch, personaId, updateChatListDetail]);

  useEffect(() => {
    const loadAndSetPersona = async () => {
        setIsLoading(true);
        let finalPersona: Persona | null = null;
        
        if (personaType === PersonaType.TOWNHALL) {
            const report = reports.find(t => t.id === personaId);
            if (report) {
                if (report.category_id === 'town-halls') {
                    finalPersona = getChatSessionPersona(PersonaType.TOWNHALL, 'town-hall-moderator');
                } else {
                    const category = townHallCategories.find(c => c.id === report.category_id);
                    finalPersona = {
                        id: report.id,
                        name: report.title,
                        type: PersonaType.TOWNHALL,
                        avatar: 'https://picsum.photos/seed/townhall-generic/96/96',
                        description: `A discussion in the ${category?.name || 'Town Halls'} category.`,
                        subtitle: `Started by ${report.author.name}`,
                        systemInstruction: '', 
                        greeting: '',
                        useSearchGrounding: false,
                    };
                }
            }
        } else {
            finalPersona = getChatSessionPersona(personaType, personaId);
        }
        
        setPersona(finalPersona);
        setShowAssistantBanner(finalPersona?.type === PersonaType.UNIGERIAN);

        try {
          let history = await getChatHistory(chatId);
          if (history.length === 0) {
             if (INITIAL_CHAT_HISTORY[chatId]) {
               history = INITIAL_CHAT_HISTORY[chatId];
             } else if (finalPersona && finalPersona.greeting) {
               const greetingMessage: Message = {
                  id: `msg_greeting_${Date.now()}`,
                  text: finalPersona.greeting,
                  sender: 'ai',
                  timestamp: Date.now(),
                  type: 'text',
               };
               history = [greetingMessage];
               await addMessage(chatId, greetingMessage);
               updateChatListDetail(greetingMessage);
             }
          }
          const loadedMessages = history.filter(m => !m.isStreaming);
          setMessages(loadedMessages);

          const report = reports.find(t => t.id === personaId);
          if (
            finalPersona?.id === 'town-hall-moderator' &&
            report &&
            report.reply_count === 0 &&
            loadedMessages.length === 1 &&
            loadedMessages[0].authorInfo?.name === userProfile.name
          ) {
            await handleTownHallResponse(finalPersona, loadedMessages, loadedMessages[0].text, true);
          }
        } catch (error) {
          console.error("Failed to load chat history:", error);
        } finally {
          setIsLoading(false);
        }
    };
    
    setSearchQuery('');
    setQuotedMessage(null);
    loadAndSetPersona();

    return () => {
        ttsService.cancel();
    };
  }, [personaType, personaId, chatId, dispatch, reports, townHallCategories, updateChatListDetail, handleTownHallResponse, userProfile.name]);

  useEffect(() => {
    if (!isAuthenticated || !chatId) return;

    const handleMessageChange = (payload: any) => {
        
        switch (payload.eventType) {
            case 'INSERT': {
                const newMessage = payload.new.message_content as Message;
                if (payload.new.user_id === userProfile.id) return;
                setMessages(prevMessages => prevMessages.some(m => m.id === newMessage.id) ? prevMessages : [...prevMessages, newMessage]);
                break;
            }
            case 'UPDATE': {
                 const updatedMessage = payload.new.message_content as Message;
                setMessages(prevMessages => prevMessages.map(m => m.id === updatedMessage.id ? updatedMessage : m));
                break;
            }
            case 'DELETE': {
                const deletedMessageId = payload.old.message_content?.id;
                if(deletedMessageId) {
                    setMessages(prev => prev.filter(m => m.id !== deletedMessageId));
                    if(chatId.startsWith('townhall_')) {
                        dispatch({ type: 'DECREMENT_REPLY_COUNT', payload: { reportId: personaId } });
                    }
                }
                break;
            }
            default:
                break;
        }
    };

    const messageSubscription = supabase
      .channel(`chat_${chatId}`)
      .on(
          'postgres_changes',
          {
              event: '*',
              schema: 'public',
              table: 'chat_messages',
              filter: `chat_id=eq.${chatId}`
          },
          handleMessageChange
      )
      .subscribe();
    
    return () => {
        if (messageSubscription) {
            supabase.removeChannel(messageSubscription);
        }
    };
  }, [chatId, isAuthenticated, dispatch, personaId, userProfile.id]);

  useEffect(() => {
    if (searchQuery) {
        const results = messages
            .filter(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(msg => msg.id);
        setSearchResults(results);
        setCurrentResultIndex(results.length > 0 ? 0 : -1);
    } else {
        setSearchResults([]);
        setCurrentResultIndex(-1);
    }
  }, [searchQuery, messages]);

  const handleStreamingResponse = async (p: Persona, history: Message[], prompt: string, imagePayload?: { mimeType: string, data: string }) => {
      const aiMessageId = `msg_${Date.now() + 1}`;
      const aiThinkingMessage: Message = {
        id: aiMessageId,
        text: '',
        sender: 'ai',
        timestamp: Date.now() + 1,
        isThinking: true,
      };
      setMessages(prev => [...prev, aiThinkingMessage]);
      
      try {
        let isFirstChunk = true;
        const onChunk = (chunk: string) => {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.id !== aiMessageId) return prev; 
            
            if (isFirstChunk) {
              isFirstChunk = false;
              const updatedMessage = {
                ...lastMessage,
                text: chunk,
                isThinking: false,
                isStreaming: true,
              };
              return [...prev.slice(0, -1), updatedMessage];
            }

            const updatedLastMessage = { ...lastMessage, text: lastMessage.text + chunk };
            return [...prev.slice(0, -1), updatedLastMessage];
          });
        };

        const onComplete = (fullResponse: string, groundingChunks: GroundingChunk[] | undefined, suggestions: string[]) => {
            let finalMessage: Message | null = null;
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (!lastMessage || lastMessage.id !== aiMessageId) {
                    console.error("Could not find the streaming message to finalize.");
                    return prev;
                }
        
                finalMessage = {
                    ...lastMessage,
                    text: fullResponse,
                    isStreaming: false,
                    groundingChunks: groundingChunks,
                };
        
                const newMessages = [...prev.slice(0, -1), finalMessage];
                return newMessages;
            });
            if(finalMessage) {
              addMessage(chatId, finalMessage);
              updateChatListDetail(finalMessage);
            }
            setSuggestedReplies(suggestions || []);
        };
        await generateStreamingResponse(p, history, prompt, onChunk, onComplete, imagePayload);

      } catch (error) {
        console.error("Streaming response failed:", error);
        dispatch({ type: 'SHOW_TOAST', payload: { message: "An API error occurred.", type: 'error' } });
        const errorAiMessage: Message = {
            id: aiMessageId,
            text: '',
            sender: 'ai',
            timestamp: aiThinkingMessage.timestamp,
            isThinking: false,
            isStreaming: false,
            error: (error as Error).message || 'Failed to get response. Please try again.',
        };
        setMessages(prev => prev.map(m => m.id === aiMessageId ? errorAiMessage : m));
        await addMessage(chatId, errorAiMessage);
        updateChatListDetail(errorAiMessage);
      }
  };

  const handleImageResponse = async (p: Persona, history: Message[], prompt: string) => {
    const imageLoadingMessage: Message = {
      id: `msg_loading_${Date.now()}`,
      text: 'Adaeze is creating an image...',
      sender: 'ai',
      timestamp: Date.now(),
      type: 'image',
      isLoading: true,
    };
    setMessages(prev => [...prev, imageLoadingMessage]);

    try {
        const imageData = await generateImageResponse(prompt);
        const finalImageMessage: Message = {
            ...imageLoadingMessage,
            isLoading: false,
            imageData: imageData || undefined,
            text: imageData ? `A digital painting inspired by: "${prompt}"` : 'Sorry, I could not create the image.'
        };
        
        setMessages(prev => prev.map(m => m.id === imageLoadingMessage.id ? finalImageMessage : m));
        await addMessage(chatId, finalImageMessage);
        updateChatListDetail(finalImageMessage);
    } catch(error) {
        console.error("Image generation failed:", error);
        dispatch({ type: 'SHOW_TOAST', payload: { message: (error as Error).message, type: 'error' } });
        const finalImageMessage: Message = {
          ...imageLoadingMessage,
          isLoading: false,
          error: (error as Error).message || "Sorry, I could not create the image.",
          text: ""
        };
        setMessages(prev => prev.map(m => m.id === imageLoadingMessage.id ? finalImageMessage : m));
        await addMessage(chatId, finalImageMessage);
        updateChatListDetail(finalImageMessage);
    }
  }

  const handleSendMessage = async (text: string, imageFile: File | null) => {
    if (!persona || !userProfile.id) return;
    
    ttsService.cancel();
    setSuggestedReplies([]); 

    let messageText = text;
    if (quotedMessage && quotedMessage.authorInfo) {
        const quoteHeader = `> **${quotedMessage.authorInfo.name} wrote:**`;
        const quotedText = `> ${quotedMessage.text.split('\n').join('\n> ')}`;
        messageText = `${quoteHeader}\n${quotedText}\n\n${text}`;
    }
    setQuotedMessage(null);

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      text: messageText,
      sender: persona.type === PersonaType.TOWNHALL ? userProfile.id : 'user',
      timestamp: Date.now(),
      type: imageFile ? 'image' : (persona.type === PersonaType.TOWNHALL ? 'post' : 'text'),
      authorInfo: persona.type === PersonaType.TOWNHALL ? { name: userProfile.name, avatar: userProfile.avatar } : undefined,
      isLoading: !!imageFile,
      imageData: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };
    
    setMessages(prev => [...prev, userMessage]);
    updateChatListDetail(userMessage);
    
    let imagePayload: { mimeType: string; data: string } | undefined = undefined;
    let finalUserMessage = userMessage;
    
    if (imageFile) {
        try {
            const base64Data = await convertFileToBase64(imageFile);
            imagePayload = { mimeType: imageFile.type, data: base64Data };
            finalUserMessage = { ...userMessage, imageData: `data:${imageFile.type};base64,${base64Data}`, isLoading: false };
            setMessages(prev => prev.map(m => m.id === userMessage.id ? finalUserMessage : m));
        } catch (e) {
            console.error("Error converting image to base64", e);
            const errorUserMessage = { ...userMessage, error: "Failed to process image.", isLoading: false };
            setMessages(prev => prev.map(m => m.id === userMessage.id ? errorUserMessage : m));
            await addMessage(chatId, errorUserMessage);
            updateChatListDetail(errorUserMessage);
            return;
        }
    }

    await addMessage(chatId, finalUserMessage);

    if (persona.type === PersonaType.TOWNHALL && finalUserMessage.sender === userProfile.id) {
        await incrementReplyCount(personaId);
        dispatch({ type: 'INCREMENT_REPLY_COUNT', payload: { reportId: personaId } });
    }
    
    const currentHistory = [...messages, finalUserMessage];
    const isTownHallTopic = persona.id === 'town-hall-moderator';

    if (isTownHallTopic) {
        await handleTownHallResponse(persona, currentHistory, text, false); 
    } else if (persona.id === 'adaeze-artist') {
        handleImageResponse(persona, currentHistory, text);
    } else if (persona.type !== PersonaType.TOWNHALL) {
      handleStreamingResponse(persona, currentHistory, text, imagePayload);
    }
  };
  
  const handleRetry = async (failedMessageId: string) => {
    const failedMessageIndex = messages.findIndex(m => m.id === failedMessageId);
    if (failedMessageIndex === -1) return;
    
    const historyToRetry = messages.slice(0, failedMessageIndex);
    const lastUserMessage = [...historyToRetry].reverse().find(m => m.sender === 'user' || m.sender === userProfile.id);

    if (!persona || !lastUserMessage) return;

    setMessages(historyToRetry); 

    const isTownHallTopic = persona.id === 'town-hall-moderator';
    
    if (isTownHallTopic) {
        await handleTownHallResponse(persona, historyToRetry, lastUserMessage.text, false);
    } else if (persona.id === 'adaeze-artist') {
        await handleImageResponse(persona, historyToRetry, lastUserMessage.text);
    } else if (persona.type !== PersonaType.TOWNHALL) {
        await handleStreamingResponse(persona, historyToRetry, lastUserMessage.text);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear this chat history? This action cannot be undone.')) {
        ttsService.cancel();
        setMessages([]); // Clear UI immediately
        await clearChatHistory(chatId);
        dispatch({ type: 'REMOVE_CHAT_LIST_DETAIL', payload: { chatId } });
        dispatch({ type: 'CLEAR_ACTIVE_CHAT' });
    }
  };

  const handleQuotePost = (message: Message) => {
    if (persona.type === PersonaType.TOWNHALL) {
        setQuotedMessage(message);
    }
  };

  const handleDeleteMessage = async (message: Message): Promise<void> => {
    if (!persona || !isAuthenticated) return;
    const isUserMessage = message.sender === 'user' || message.sender === userProfile.id;
    if (!isUserMessage) return;

    if (window.confirm("Are you sure you want to delete this message? This cannot be undone.")) {
        try {
            setMessages(prev => prev.filter(m => m.id !== message.id));
            if (persona.type === PersonaType.TOWNHALL) {
                if (message.isOriginalPost) {
                    dispatch({ type: 'SHOW_TOAST', payload: { message: "Cannot delete the first post. Delete the report instead.", type: 'error' } });
                    setMessages(messages); // revert optimistic deletion
                    return;
                }
                await deleteTownHallPost(message.id, personaId);
            } else {
                await deleteDirectMessage(message.id, chatId);
            }
            dispatch({ type: 'SHOW_TOAST', payload: { message: "Message deleted" } });
        } catch (error) {
            console.error("Failed to delete message:", error);
            dispatch({ type: 'SHOW_TOAST', payload: { message: (error as Error).message || "Could not delete message.", type: 'error' } });
            setMessages(messages); // revert optimistic deletion
        }
    }
  };
  
  const handleEditPost = async (messageId: string, newText: string) => {
    const now = Date.now();
    setMessages(prev => prev.map(m => 
        m.id === messageId 
            ? { ...m, text: newText, updated_at: now } 
            : m
    ));

    try {
        await updateMessageContent(messageId, chatId, newText);
    } catch (error) {
        console.error("Failed to edit post:", error);
        dispatch({ type: 'SHOW_TOAST', payload: { message: 'Failed to save edit.', type: 'error' } });
        setMessages(prev => {
            const originalMessage = messages.find(m => m.id === messageId);
            return prev.map(m => m.id === messageId ? originalMessage || m : m);
        });
    }
  };

  const handleLikePost = async (messageId: string): Promise<void> => {
    if (!isAuthenticated || !userProfile.id) {
      dispatch({ type: 'SHOW_AUTH_OVERLAY', payload: 'login' });
      return;
    }

    const originalMessages = [...messages];
    
    setMessages(prev =>
      prev.map(m => {
        if (m.id === messageId) {
          const currentLikes = m.likes || [];
          const userIndex = currentLikes.indexOf(userProfile.id!);
          let newLikes: string[];

          if (userIndex > -1) {
            newLikes = currentLikes.filter(id => id !== userProfile.id);
          } else {
            newLikes = [...currentLikes, userProfile.id!];
          }
          return { ...m, likes: newLikes };
        }
        return m;
      })
    );

    try {
      await toggleLikePost(messageId, chatId, userProfile.id);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'Could not update like.', type: 'error' } });
      setMessages(originalMessages);
    }
  };

  const displayedMessages = useMemo(() => {
    if (searchQuery) {
        const resultsIds = new Set(searchResults);
        return messages.filter(m => resultsIds.has(m.id));
    }
    return messages;
  }, [messages, searchQuery, searchResults]);
  
  const messagesWithSearchHighlight = useMemo(() => {
      if (searchResults.length > 0 && currentResultIndex >= 0) {
          const currentResultId = searchResults[currentResultIndex];
          return displayedMessages.map(m => ({ ...m, isCurrentSearchResult: m.id === currentResultId }));
      }
      return displayedMessages.map(m => ({ ...m, isCurrentSearchResult: false }));
  }, [displayedMessages, searchResults, currentResultIndex]);

  if (isLoading || !persona) {
    return <ChatScreenSkeleton />;
  }

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-dark-primary">
      <ChatHeader 
          persona={persona} 
          onClearChat={handleClearChat}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResultsCount={searchResults.length}
          currentResultIndex={currentResultIndex}
          setCurrentResultIndex={setCurrentResultIndex}
      />
      {showAssistantBanner && (
          <AssistantInfoBanner personaName={persona.name} onDismiss={() => setShowAssistantBanner(false)} />
      )}
      <MessageArea 
        messages={messagesWithSearchHighlight} 
        persona={persona} 
        onRetry={handleRetry} 
        onQuotePost={handleQuotePost}
        onDeleteMessage={handleDeleteMessage}
        onEditPost={handleEditPost}
        onLikePost={handleLikePost}
      />
      <MessageInput 
        onSendMessage={handleSendMessage} 
        persona={persona} 
        suggestedReplies={suggestedReplies}
        quotedMessage={quotedMessage}
        onClearQuote={() => setQuotedMessage(null)}
      />
    </div>
  );
};

export default ChatScreen;