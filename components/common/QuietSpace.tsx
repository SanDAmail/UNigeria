
import React, { useState, useEffect } from 'react';
import { Icons, INSPIRATIONAL_QUOTES } from '../../constants';
import { useAppDispatch } from '../../context/AppContext';

const QuietSpace: React.FC = () => {
    const dispatch = useAppDispatch();
    const [quote, setQuote] = useState({ author: '', quote: '' });

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
        setQuote(INSPIRATIONAL_QUOTES[randomIndex]);
    }, []);

    const handleClose = () => {
        dispatch({ type: 'TOGGLE_QUIET_SPACE' });
    };

    return (
        <div className="fixed inset-0 w-screen h-screen quiet-space-bg z-[100] flex items-center justify-center p-8">
            <div className="stars"></div>
            <div className="stars2"></div>
            <div className="stars3"></div>
            
            <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white/50 hover:text-white/80 transition-colors z-10"
                aria-label="Close quiet space"
            >
                <Icons.XMark className="w-8 h-8" />
            </button>
            
            <div className="text-center text-white max-w-4xl animate-fade-in-down z-10">
                <blockquote className="text-2xl md:text-4xl font-light italic leading-relaxed md:leading-loose">
                    "{quote.quote}"
                </blockquote>
                <cite className="block mt-6 text-lg md:text-xl font-semibold not-italic text-white/80">
                    - {quote.author}
                </cite>
            </div>
        </div>
    );
};

export default QuietSpace;
