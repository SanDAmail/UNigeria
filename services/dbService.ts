import { Message, ChatListDetail, Report, TownHallCategory, UserProfile, Endorsement } from '../types';
import { supabase } from './supabaseService';
import { PERSONA_LIST } from '../constants';

const DB_NAME = 'UNigeriaDB_Cache';
const DB_VERSION = 1;
const CHAT_HISTORY_STORE = 'chatHistories';

let db: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening DB');
      reject('Error opening DB');
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(CHAT_HISTORY_STORE)) {
        dbInstance.createObjectStore(CHAT_HISTORY_STORE, { keyPath: 'id' });
      }
    };
  });
};

// --- Local IndexedDB Functions (as cache/fallback) ---

const getChatHistoryFromIDB = async (chatId: string): Promise<Message[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHAT_HISTORY_STORE], 'readonly');
    const store = transaction.objectStore(CHAT_HISTORY_STORE);
    const request = store.get(chatId);

    request.onerror = () => reject('Error fetching chat history from IDB');
    request.onsuccess = () => resolve(request.result ? request.result.messages : []);
  });
};

const saveChatHistoryToIDB = async (chatId: string, messages: Message[]): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHAT_HISTORY_STORE], 'readwrite');
    const store = transaction.objectStore(CHAT_HISTORY_STORE);
    const request = store.put({ id: chatId, messages });
    
    request.onerror = () => reject('Error saving chat history to IDB');
    request.onsuccess = () => resolve();
  });
};

const clearChatHistoryFromIDB = async (chatId: string): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([CHAT_HISTORY_STORE], 'readwrite');
        const store = transaction.objectStore(CHAT_HISTORY_STORE);
        const request = store.delete(chatId);
        request.onerror = () => reject('Error clearing chat from IDB');
        request.onsuccess = () => resolve();
    });
};

export const clearAllLocalChats = async (): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([CHAT_HISTORY_STORE], 'readwrite');
        const store = transaction.objectStore(CHAT_HISTORY_STORE);
        const request = store.clear();
        request.onerror = () => reject('Error clearing chat store from IDB');
        request.onsuccess = () => resolve();
    });
};


// --- Public API mixing Supabase and IDB ---

export const getChatHistory = async (chatId: string): Promise<Message[]> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('message_content')
            .eq('user_id', user.id)
            .eq('chat_id', chatId)
            .order('message_content->>timestamp', { ascending: true });

        if (error) {
            console.error("Error fetching chat from Supabase, falling back to cache", error);
            return getChatHistoryFromIDB(chatId);
        }

        const messages = data.map(row => row.message_content as Message);
        await saveChatHistoryToIDB(chatId, messages); // Update cache
        return messages;
    } else {
        return getChatHistoryFromIDB(chatId);
    }
}

export const addMessage = async (chatId: string, message: Message): Promise<void> => {
    // 1. Update local cache immediately for UI responsiveness
    const currentHistory = await getChatHistoryFromIDB(chatId);
    const newHistory = [...currentHistory, message];
    await saveChatHistoryToIDB(chatId, newHistory);

    // 2. Persist to Supabase if logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // Remove transient properties before saving to DB
        const { isStreaming, isThinking, isLoading, isCurrentSearchResult, ...messageToSave } = message;
        
        const { error } = await supabase.from('chat_messages').insert({
            user_id: user.id,
            chat_id: chatId,
            message_content: messageToSave
        });

        if (error) {
            console.error("Error saving message to Supabase:", error);
            // Optionally, implement retry logic or notify user
            throw error;
        }
    }
};

export const updateMessageContent = async (messageId: string, chatId: string, newText: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // 1. Fetch the existing message to preserve its other properties
    const { data: messageData, error: fetchError } = await supabase
        .from('chat_messages')
        .select('message_content')
        .eq('chat_id', chatId)
        .eq('user_id', user.id)
        .eq('message_content->>id', messageId)
        .single();

    if (fetchError || !messageData) {
        console.error("Error fetching message to update:", fetchError);
        throw new Error("Could not find the message to update.");
    }

    // 2. Modify the message content
    const updatedContent: Message = {
        ...messageData.message_content,
        text: newText,
        updated_at: Date.now() // Add updated timestamp
    };

    // 3. Update the row in the database
    const { error: updateError } = await supabase
        .from('chat_messages')
        .update({ message_content: updatedContent })
        .eq('chat_id', chatId)
        .eq('user_id', user.id)
        .eq('message_content->>id', messageId);

    if (updateError) {
        console.error("Error updating message in Supabase:", updateError);
        throw updateError;
    }
};

export const toggleLikePost = async (messageId: string, chatId: string, userId: string): Promise<Message> => {
    // 1. Fetch the message
    const { data: messageData, error: fetchError } = await supabase
        .from('chat_messages')
        .select('id, message_content')
        .eq('chat_id', chatId)
        .eq('message_content->>id', messageId)
        .single();

    if (fetchError || !messageData) {
        console.error("Error fetching message to like:", fetchError);
        throw new Error("Could not find the message to like.");
    }

    const currentMessage: Message = messageData.message_content;
    const currentLikes: string[] = currentMessage.likes || [];
    
    let newLikes: string[];
    const userIndex = currentLikes.indexOf(userId);

    if (userIndex > -1) {
        // User has already liked, so unlike
        newLikes = currentLikes.filter(id => id !== userId);
    } else {
        // User has not liked, so like
        newLikes = [...currentLikes, userId];
    }

    const updatedMessageContent: Message = {
        ...currentMessage,
        likes: newLikes,
    };

    // 3. Update the row
    const { data: updatedData, error: updateError } = await supabase
        .from('chat_messages')
        .update({ message_content: updatedMessageContent })
        .eq('id', messageData.id) // Use the primary key for the update
        .select('message_content')
        .single();
    
    if (updateError || !updatedData) {
        console.error("Error updating message with like:", updateError);
        throw new Error("Could not update like status.");
    }
    
    return updatedData.message_content as Message;
}

export const clearChatHistory = async (chatId: string): Promise<void> => {
    await clearChatHistoryFromIDB(chatId);

    const { data: { user } } = await supabase.auth.getUser();
    if(user) {
        const { error } = await supabase
            .from('chat_messages')
            .delete()
            .match({ user_id: user.id, chat_id: chatId });
        
        if (error) {
            console.error("Error clearing chat from Supabase:", error);
            throw error;
        }
    }
}

export const getChatListDetails = async (): Promise<{ [key: string]: ChatListDetail }> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // Fetch from Supabase
        const { data, error } = await supabase.rpc('get_latest_messages_for_user');

        if (error) {
            console.error("Error fetching chat list details from Supabase RPC, will use local.", error);
        } else if (data) {
            const details: { [chatId: string]: ChatListDetail } = {};
            for (const row of data) {
                const message = row.message_content as Message;
                const lastMessageText = message.error ? '[Error]' : message.type === 'image' ? `[Image] ${message.text}`.trim() : message.text;
                details[row.chat_id] = {
                    lastMessage: lastMessageText,
                    timestamp: message.timestamp
                };
            }
            return details;
        }
    }
    
    // Fallback for anonymous users or if Supabase fetch fails
    const details: { [key: string]: ChatListDetail } = {};
    const allChatIds = PERSONA_LIST.map(p => `${p.type}_${p.id}`);
    for (const chatId of allChatIds) {
        try {
            const history = await getChatHistoryFromIDB(chatId);
            if (history.length > 0) {
                const lastMsg = history[history.length - 1];
                const lastMessageText = lastMsg.error ? '[Error]' : lastMsg.type === 'image' ? `[Image] ${lastMsg.text}`.trim() : lastMsg.text;
                details[chatId] = { lastMessage: lastMessageText, timestamp: lastMsg.timestamp };
            }
        } catch (e) {
            console.error(`Failed to get history for ${chatId} from IDB`, e);
        }
    }
    return details;
};

// --- User Profile Functions ---

export const getUserProfileById = async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, name, title, avatar, state, lga, ward, is_candidate, is_representative, tenure_end_date')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
    return data;
}

export const uploadUserAvatar = async (userId: string, file: File): Promise<string> => {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExtension}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('user_assets')
        .upload(filePath, file);

    if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        throw uploadError;
    }

    const { data } = supabase.storage
        .from('user_assets')
        .getPublicUrl(filePath);

    if (!data.publicUrl) {
        throw new Error("Could not get public URL for uploaded avatar.");
    }
    
    return data.publicUrl;
};


// --- Town Hall Specific Functions ---

export const getTownHallCategories = async (): Promise<TownHallCategory[]> => {
    const { data, error } = await supabase.from('forum_categories').select('*');
    if (error) {
        console.error('Error fetching town hall categories:', error);
        return [];
    }
    return data as TownHallCategory[];
};

export const getReports = async (filters: { state?: string, lga?: string } = {}): Promise<Report[]> => {
    let query = supabase
        .from('forum_topics')
        .select(`
            *,
            author:profiles (
                name,
                avatar
            )
        `)
        .order('created_at', { ascending: false });

    if (filters.state) {
        query = query.eq('location->>state', filters.state);
    }
    if (filters.lga) {
        query = query.eq('location->>lga', filters.lga);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching reports:', error);
        return [];
    }

    return data.map((d: any) => ({
        ...d,
        lastReply: `by ${d.author?.name || '...'}`,
    }));
};

export const searchReports = async (query: string): Promise<Report[]> => {
    if (!query) return [];

    const { data, error } = await supabase
        .from('forum_topics')
        .select(`
            *,
            author:profiles (
                name,
                avatar
            )
        `)
        .ilike('title', `%${query}%`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error searching reports:', error);
        return [];
    }

    return data.map((d: any) => ({
        ...d,
        lastReply: `by ${d.author?.name || '...'}`,
    }));
};

export const createReport = async (title: string, category_id: string, author_id: string, location: { state: string, lga: string, ward: string }): Promise<Report | null> => {
    const { data, error } = await supabase
        .from('forum_topics')
        .insert({ title, category_id, author_id, location })
        .select(`
            *,
            author:profiles (
                name,
                avatar
            )
        `)
        .single();
    
    if (error) {
        console.error('Error creating report:', error);
        return null;
    }
    return { ...data, lastReply: `by ${data.author.name}` };
};

export const deleteReport = async (reportId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in to delete a report.");

    const chatId = `townhall_${reportId}`;
    await supabase.from('chat_messages').delete().eq('chat_id', chatId);
    await supabase.from('forum_topics').delete().eq('id', reportId).eq('author_id', user.id);
};

export const incrementReplyCount = async (reportId: string): Promise<void> => {
    const { error } = await supabase.rpc('increment_topic_reply_count', {
        topic_id_arg: reportId
    });
    if (error) console.error('Error incrementing reply count:', error);
};

export const decrementReplyCount = async (reportId: string): Promise<void> => {
    const { error } = await supabase.rpc('decrement_topic_reply_count', {
        topic_id_arg: reportId
    });
    if (error) console.error('Error decrementing reply count:', error);
};

export const deleteTownHallPost = async (messageId: string, reportId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in to delete a post.");

    const chatId = `townhall_${reportId}`;
    await supabase.from('chat_messages').delete().match({ chat_id: chatId, user_id: user.id }).eq('message_content->>id', messageId);
    await decrementReplyCount(reportId);
};

export const deleteDirectMessage = async (messageId: string, chatId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in to delete a message.");

    await supabase.from('chat_messages').delete().match({ chat_id: chatId, user_id: user.id }).eq('message_content->>id', messageId);
};


// --- UNigerian Governance Functions ---

export const getRepresentatives = async (location: { state?: string, lga?: string }): Promise<UserProfile[]> => {
    let query = supabase.from('profiles').select('*').eq('is_representative', true);
    if (location.state) query = query.eq('state', location.state);
    if (location.lga) query = query.eq('lga', location.lga);
    
    const { data, error } = await query.order('name');
    if (error) {
        console.error("Error fetching representatives:", error);
        return [];
    }
    return data as UserProfile[];
}

export const getCandidates = async (location: { state?: string, lga?: string }): Promise<UserProfile[]> => {
    let query = supabase.from('profiles').select('*, endorsements(count)').eq('is_candidate', true);
    if (location.state) query = query.eq('state', location.state);
    if (location.lga) query = query.eq('lga', location.lga);

    const { data, error } = await query.order('name');
    if (error) {
        console.error("Error fetching candidates:", error);
        return [];
    }
    
    return data.map((d: any) => ({
        ...d,
        endorsement_count: d.endorsements[0]?.count || 0
    }));
}


export const declareCandidacy = async (userId: string): Promise<void> => {
    const { error } = await supabase.from('profiles').update({ is_candidate: true }).eq('id', userId);
    if (error) throw error;
}

export const addEndorsement = async (candidateId: string, endorserId: string): Promise<{ success: boolean, message: string }> => {
    // Simplified election cycle for now
    const election_cycle = `${new Date().getFullYear()}-${new Date().getFullYear() + 2}`;
    
    // Check if user has already endorsed someone in their LGA for this cycle
    const { data: existingEndorsement, error: checkError } = await supabase.rpc('has_endorsed_in_lga_cycle', {
        p_endorser_id: endorserId,
        p_election_cycle: election_cycle
    });

    if (checkError) {
        console.error("Error checking endorsement:", checkError);
        return { success: false, message: "Could not verify endorsement status." };
    }
    
    if (existingEndorsement) {
        return { success: false, message: "You have already endorsed a candidate in your LGA for this cycle." };
    }

    const { error } = await supabase.from('endorsements').insert({
        candidate_id: candidateId,
        endorser_id: endorserId,
        election_cycle: election_cycle,
        weight: 1.0 // Weighting logic to be implemented later
    });

    if (error) {
        console.error("Error adding endorsement:", error);
        return { success: false, message: "Failed to add endorsement." };
    }
    
    return { success: true, message: "Endorsement successful!" };
}

export const getEndorsementsForUser = async (userId: string): Promise<Endorsement[]> => {
    const { data, error } = await supabase.from('endorsements').select('*').eq('endorser_id', userId);
    if (error) {
        console.error("Error fetching user endorsements:", error);
        return [];
    }
    return data;
}

export const getEndorsementCount = async (candidateId: string): Promise<number> => {
    const { count, error } = await supabase.from('endorsements').select('*', { count: 'exact', head: true }).eq('candidate_id', candidateId);
    if (error) {
        console.error("Error getting endorsement count:", error);
        return 0;
    }
    return count || 0;
};