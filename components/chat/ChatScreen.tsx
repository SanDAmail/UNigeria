
import React, { useState, useEffect, useMemo } from 'react';
import { Persona, PersonaType, Message, GroundingChunk } from '../../types';
import { getChatSessionPersona } from '../../personas/personas';
import ChatHeader from './ChatHeader';
import MessageArea from './MessageArea';
import MessageInput from './MessageInput';
import { getChatHistory, saveChatHistory } from '../../services/dbService';
import { generateStreamingResponse, generateImageResponse } from '../../services/geminiService';
import { forumService } from '../../services/forumService';
import { ttsService } from '../../services/ttsService';
import { INITIAL_CHAT_HISTORY, Icons } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/AppContext';

// --- Skeleton Loader Component ---
const SkeletonBubble: React.FC<{ align: 'left' | 'right', width: string }> = ({ align, width }) => (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        <div className={`shimmer rounded-xl p-3 ${width}`} style={{height: '48px'}}></div>
    </div>
);

const ChatScreenSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col h-full w-full bg-white">
            {/* Header */}
            <header className="flex-shrink-0 bg-white border-b border-ui-border p-3 flex items-center justify-between z-10">
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
            <footer className="flex-shrink-0 bg-white border-t border-ui-border p-3">
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
  const { userProfile } = useAppState();
  const dispatch = useAppDispatch();
  const chatId = `${personaType}_${personaId}`;

  // In-Chat Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);

  useEffect(() => {
    const currentPersona = getChatSessionPersona(personaType, personaId);
    setPersona(currentPersona);
    setSearchQuery(''); // Reset search on persona change

    const loadHistory = async () => {
      setIsLoading(true);
      try {
        let history = await getChatHistory(chatId);
        if (history.length === 0) {
           if (INITIAL_CHAT_HISTORY[chatId]) {
             history = INITIAL_CHAT_HISTORY[chatId];
             await saveChatHistory(chatId, history);
           } else if (currentPersona && currentPersona.greeting) {
             const greetingMessage: Message = {
                id: `msg_greeting_${Date.now()}`,
                text: currentPersona.greeting,
                sender: 'ai',
                timestamp: Date.now(),
                type: 'text',
             };
             history = [greetingMessage];
             await saveChatHistory(chatId, history);
             dispatch({
                type: 'UPDATE_CHAT_LIST_DETAIL',
                payload: {
                    chatId: chatId,
                    detail: { lastMessage: greetingMessage.text, timestamp: greetingMessage.timestamp }
                }
             });
           }
        }
        setMessages(history.filter(m => !m.isStreaming)); // Filter out incomplete messages from previous sessions
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();

    return () => {
        ttsService.cancel();
    };
  }, [personaType, personaId, chatId, dispatch]);

  // Effect for handling search
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


  const updateChatListDetail = (message: Message) => {
    dispatch({
      type: 'UPDATE_CHAT_LIST_DETAIL',
      payload: {
        chatId: chatId,
        detail: { lastMessage: message.error ? '[Error]' : message.type === 'image' ? `[Image] ${message.text}`.trim() : message.text, timestamp: message.timestamp }
      }
    });
  };

  const handleSendMessage = async (text: string, imageFile: File | null) => {
    if (!persona) return;
    
    ttsService.cancel();
    setSuggestedReplies([]); 

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      text,
      sender: 'user',
      timestamp: Date.now(),
      type: imageFile ? 'image' : (persona.type === PersonaType.FORUM ? 'post' : 'text'),
      authorInfo: persona.type === PersonaType.FORUM ? userProfile : undefined,
      isLoading: !!imageFile,
      imageData: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    updateChatListDetail(userMessage);

    let imagePayload: { mimeType: string; data: string } | undefined = undefined;
    
    if (imageFile) {
        try {
            const base64Data = await convertFileToBase64(imageFile);
            imagePayload = { mimeType: imageFile.type, data: base64Data };

            // Update message with base64 data for storage and final display
            const finalUserMessage = { ...userMessage, imageData: `data:${imageFile.type};base64,${base64Data}`, isLoading: false };
            const finalMessages = [...messages, finalUserMessage];
            setMessages(finalMessages);
            await saveChatHistory(chatId, finalMessages);
        } catch (e) {
            console.error("Error converting image to base64", e);
            // Handle error - maybe show an error in the message bubble
            const errorUserMessage = { ...userMessage, error: "Failed to process image.", isLoading: false };
            const finalMessages = [...messages, errorUserMessage];
            setMessages(finalMessages);
            await saveChatHistory(chatId, finalMessages);
            updateChatListDetail(errorUserMessage);
            return; // Don't proceed to call AI
        }
    } else {
       await saveChatHistory(chatId, updatedMessages);
    }

    if (persona.id === 'adaeze-artist') {
        handleImageResponse(persona, updatedMessages, text);
    } else if (persona.type === PersonaType.FORUM) {
      handleForumResponse(persona, updatedMessages, text);
    } else {
      handleStreamingResponse(persona, updatedMessages, text, imagePayload);
    }
  };
  
  const handleRetry = async (failedMessageId: string) => {
    const failedMessageIndex = messages.findIndex(m => m.id === failedMessageId);
    if (failedMessageIndex === -1) return;
    
    const historyToRetry = messages.slice(0, failedMessageIndex);
    const lastUserMessage = [...historyToRetry].reverse().find(m => m.sender === 'user' || m.sender === userProfile.name);

    if (!persona || !lastUserMessage) return;

    setMessages(historyToRetry); 

    // Note: Retrying image uploads is not implemented for simplicity.
    // This would require persisting the original File object or its base64 representation.

    if (persona.id === 'adaeze-artist') {
        await handleImageResponse(persona, historyToRetry, lastUserMessage.text);
    } else if (persona.type === PersonaType.FORUM) {
        await handleForumResponse(persona, historyToRetry, lastUserMessage.text);
    } else {
        await handleStreamingResponse(persona, historyToRetry, lastUserMessage.text);
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
        
        const finalMessages = [...history, finalImageMessage];
        setMessages(finalMessages);
        await saveChatHistory(chatId, finalMessages);
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
        const finalMessages = [...history, finalImageMessage];
        setMessages(finalMessages);
        await saveChatHistory(chatId, finalMessages);
        updateChatListDetail(finalImageMessage);
    }
  }

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
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (!lastMessage || lastMessage.id !== aiMessageId) {
                    console.error("Could not find the streaming message to finalize.");
                    return prev;
                }
        
                const updatedMessage = {
                    ...lastMessage,
                    text: fullResponse,
                    isStreaming: false,
                    groundingChunks: groundingChunks,
                };
        
                const newMessages = [...prev.slice(0, -1), updatedMessage];
                
                saveChatHistory(chatId, newMessages);
                updateChatListDetail(updatedMessage);
                
                return newMessages;
            });
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
        const finalMessages = [...history, errorAiMessage];
        setMessages(finalMessages);
        await saveChatHistory(chatId, finalMessages);
        updateChatListDetail(errorAiMessage);
      }
  };

  const handleForumResponse = async (p: Persona, history: Message[], prompt: string) => {
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

    const [_, categoryId, topicId] = chatId.split('_');
    
    try {
        const isNewTopic = history.filter(m => m.sender === 'user').length === 1;

        if (isNewTopic) {
            const moderatedResponses = await forumService.generateInitialDiscussion(p, history, prompt);
            setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));

            let currentMessages = [...history];
            let lastPost: Message | null = null;
            let newReplies: Message[] = [];

            for (let i = 0; i < moderatedResponses.length; i++) {
                const item = moderatedResponses[i];
                const speakerAvatar = `https://picsum.photos/seed/${item.speaker.replace(/\s/g, '')}/40/40`;
                
                const newPost: Message = {
                    id: `post_${Date.now() + i}`,
                    text: item.text,
                    sender: item.speaker,
                    timestamp: Date.now() + i,
                    type: 'post',
                    authorInfo: { name: item.speaker, avatar: speakerAvatar },
                };
                lastPost = newPost;
                newReplies.push(newPost);

                currentMessages = [...currentMessages, newPost];
                setMessages([...currentMessages]);
                await saveChatHistory(chatId, currentMessages);

                if (i < moderatedResponses.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
                }
            }
            if (lastPost) {
                updateChatListDetail(lastPost);
                dispatch({ type: 'ADD_FORUM_REPLIES', payload: { categoryId, topicId, replies: newReplies }});
            }
        } else {
            const reply = await forumService.generateReply(p, history, prompt);
            const speakerAvatar = `https://picsum.photos/seed/${reply.speaker.replace(/\s/g, '')}/40/40`;
            const newPost: Message = {
                id: `post_${Date.now()}`,
                text: reply.text,
                sender: reply.speaker,
                timestamp: Date.now(),
                type: 'post',
                authorInfo: { name: reply.speaker, avatar: speakerAvatar },
            };
            const finalMessages = [...history, newPost];
            setMessages(finalMessages);
            await saveChatHistory(chatId, finalMessages);
            updateChatListDetail(newPost);
            dispatch({ type: 'ADD_FORUM_REPLIES', payload: { categoryId, topicId, replies: [newPost] }});
        }

    } catch (error) {
        console.error("Forum response failed:", error);
        dispatch({ type: 'SHOW_TOAST', payload: { message: (error as Error).message, type: 'error' } });
        
        const finalHistory = messages.filter(m => m.id !== thinkingMessage.id);
        const errorPost: Message = {
            id: `post_error_${Date.now()}`,
            text: '',
            sender: p.name,
            timestamp: Date.now(),
            type: 'post',
            authorInfo: { name: p.name, avatar: p.avatar },
            error: (error as Error).message || 'Failed to generate discussion.',
        };
        const finalMessages = [...finalHistory, errorPost];
        setMessages(finalMessages);
        await saveChatHistory(chatId, finalMessages);
        updateChatListDetail(errorPost);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear this chat history? This action cannot be undone.')) {
        ttsService.cancel();
        dispatch({ type: 'CLEAR_ACTIVE_CHAT' });
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
    <div className="flex flex-col h-full w-full bg-white">
      <ChatHeader 
          persona={persona} 
          onClearChat={handleClearChat}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResultsCount={searchResults.length}
          currentResultIndex={currentResultIndex}
          setCurrentResultIndex={setCurrentResultIndex}
      />
      <MessageArea messages={messagesWithSearchHighlight} persona={persona} onRetry={handleRetry} />
      <MessageInput onSendMessage={handleSendMessage} persona={persona} suggestedReplies={suggestedReplies} />
    </div>
  );
};

export default ChatScreen;
