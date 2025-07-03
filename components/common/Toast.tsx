import React, { useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Icons } from '../../constants';

const Toast: React.FC = () => {
    const { toast } = useAppState();
    const dispatch = useAppDispatch();
    const [isVisible, setIsVisible] = React.useState(false);

    useEffect(() => {
        if (toast) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                 // Allow animation to finish before removing from state
                setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 300);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [toast, dispatch]);

    if (!toast) {
        return null;
    }

    const isError = toast.type === 'error';
    const toastClasses = isVisible ? 'toast-enter-active' : 'toast-exit-active';
    const bgClass = isError ? 'bg-red-600' : 'bg-primary';
    const icon = isError 
        ? <Icons.XCircle className="w-5 h-5 mr-2 text-white" />
        : <Icons.CheckCircle className="w-5 h-5 mr-2 text-green-400" />;

    return (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${toastClasses} opacity-0`}>
            <div className={`flex items-center text-white rounded-full shadow-lg px-4 py-2 ${bgClass}`}>
                {icon}
                <span className="text-sm font-medium">{toast.message}</span>
            </div>
        </div>
    );
};

export default Toast;