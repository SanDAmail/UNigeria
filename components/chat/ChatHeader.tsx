import React, { useState, useEffect } from 'react';
import { Persona, PersonaType } from '../../types';
import { Icons } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/AppContext';

interface ChatHeaderProps {
  persona: Persona;
  onClearChat: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResultsCount: number;
  currentResultIndex: number;
  setCurrentResultIndex: (index: number) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
    persona, 
    onClearChat,
    searchQuery,
    setSearchQuery,
    searchResultsCount,
    currentResultIndex,
    setCurrentResultIndex,
}) => {
  const dispatch = useAppDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
      if (!isSearchActive) {
          setSearchQuery('');
      }
  }, [isSearchActive, setSearchQuery]);

  const handleBack = () => {
    dispatch({ type: 'CLEAR_ACTIVE_CHAT' }); 
  };
  
  const handleToggleSearch = () => {
      setIsSearchActive(!isSearchActive);
  }

  const handleNavigateSearch = (direction: 'next' | 'prev') => {
      if (searchResultsCount === 0) return;
      let nextIndex = direction === 'next' ? currentResultIndex + 1 : currentResultIndex - 1;
      if (nextIndex >= searchResultsCount) nextIndex = 0;
      if (nextIndex < 0) nextIndex = searchResultsCount - 1;
      setCurrentResultIndex(nextIndex);
  }

  const handleClearChat = () => {
    onClearChat();
    setIsMenuOpen(false);
  };

  const handleShowProfile = () => {
    dispatch({ type: 'SHOW_PROFILE_OVERLAY' });
  };
  
  if (isSearchActive) {
      return (
         <header className="flex-shrink-0 bg-white border-b border-ui-border p-3 flex items-center justify-between z-10 space-x-2">
            <div className="flex-1 flex items-center bg-app-light rounded-full border-2 border-transparent focus-within:border-primary-green transition-colors">
                <Icons.MagnifyingGlass className="w-5 h-5 text-secondary mx-3" />
                <input
                    type="text"
                    placeholder="Search in chat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="flex-1 bg-transparent py-1.5 focus:outline-none"
                />
                 {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-2 text-secondary hover:text-primary">
                        <Icons.XCircle className="w-5 h-5" />
                    </button>
                )}
            </div>
            {searchQuery && (
                <div className="flex items-center space-x-1 text-sm text-secondary">
                    <span>{searchResultsCount > 0 ? `${currentResultIndex + 1} of ${searchResultsCount}` : '0 results'}</span>
                    <button onClick={() => handleNavigateSearch('prev')} className="p-1 hover:bg-gray-200 rounded-full disabled:opacity-50" disabled={searchResultsCount === 0}><Icons.ChevronUp className="w-5 h-5"/></button>
                    <button onClick={() => handleNavigateSearch('next')} className="p-1 hover:bg-gray-200 rounded-full disabled:opacity-50" disabled={searchResultsCount === 0}><Icons.ChevronDown className="w-5 h-5"/></button>
                </div>
            )}
            <button onClick={handleToggleSearch} className="p-2 text-secondary hover:text-primary-green font-semibold rounded-lg text-sm">
                Cancel
            </button>
        </header>
      )
  }

  return (
    <header className="flex-shrink-0 bg-white border-b border-ui-border p-3 flex items-center justify-between z-10">
      <div className="flex items-center space-x-3">
        <button onClick={handleBack} className="lg:hidden p-1 text-secondary">
          <Icons.ArrowLeft className="w-6 h-6" />
        </button>
        <div 
          className="flex items-center space-x-3 cursor-pointer rounded-md p-1 -m-1 transition-colors lg:cursor-default"
          onClick={handleShowProfile}
        >
          <img src={persona.avatar} alt={persona.name} className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-semibold text-primary">{persona.name}</p>
            <p className="text-xs text-secondary">{persona.subtitle}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <button onClick={handleShowProfile} className="p-2 text-secondary hover:text-primary lg:hidden" aria-label="Show profile information">
            <Icons.InformationCircle className="w-6 h-6" />
        </button>
        <button onClick={handleToggleSearch} className="p-2 text-secondary hover:text-primary" aria-label="Search in chat">
            <Icons.MagnifyingGlass className="w-6 h-6" />
        </button>
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-secondary hover:text-primary">
            <Icons.EllipsisVertical className="w-6 h-6" />
          </button>
          {isMenuOpen && (
            <div 
              className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-20 border border-ui-border"
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              <button 
                onClick={handleClearChat} 
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-app-light"
              >
                Clear Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;