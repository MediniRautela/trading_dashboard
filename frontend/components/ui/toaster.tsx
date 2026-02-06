'use client';

/**
 * Toast component and hook for notifications
 */
import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

// Toast context
type ToastType = 'default' | 'success' | 'error' | 'warning';

interface Toast {
    id: string;
    title: string;
    description?: string;
    type: ToastType;
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Helper function for quick toasts
export function toast(title: string, options?: { description?: string; type?: ToastType }) {
    // This will be set by the Toaster component
    if (typeof window !== 'undefined' && (window as unknown as { __addToast?: (t: Omit<Toast, 'id'>) => void }).__addToast) {
        (window as unknown as { __addToast: (t: Omit<Toast, 'id'>) => void }).__addToast({
            title,
            description: options?.description,
            type: options?.type || 'default',
        });
    }
}

// Toaster component
export function Toaster() {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { ...toast, id }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Expose addToast globally for the toast() helper
    React.useEffect(() => {
        (window as unknown as { __addToast?: (t: Omit<Toast, 'id'>) => void }).__addToast = addToast;
        return () => {
            delete (window as unknown as { __addToast?: (t: Omit<Toast, 'id'>) => void }).__addToast;
        };
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            <ToastPrimitives.Provider swipeDirection="right">
                {toasts.map((t) => (
                    <ToastPrimitives.Root
                        key={t.id}
                        className={cn(
                            'fixed bottom-4 right-4 z-50 flex items-start gap-3 rounded-lg p-4 shadow-lg',
                            'bg-background-secondary border border-border',
                            'data-[state=open]:animate-slide-up data-[state=closed]:animate-fade-out',
                            t.type === 'success' && 'border-success/50',
                            t.type === 'error' && 'border-danger/50',
                            t.type === 'warning' && 'border-warning/50'
                        )}
                    >
                        <div className="flex-1">
                            <ToastPrimitives.Title className="text-sm font-medium text-foreground">
                                {t.title}
                            </ToastPrimitives.Title>
                            {t.description && (
                                <ToastPrimitives.Description className="mt-1 text-sm text-foreground-secondary">
                                    {t.description}
                                </ToastPrimitives.Description>
                            )}
                        </div>
                        <ToastPrimitives.Close
                            className="text-foreground-muted hover:text-foreground"
                            onClick={() => removeToast(t.id)}
                        >
                            <X className="h-4 w-4" />
                        </ToastPrimitives.Close>
                    </ToastPrimitives.Root>
                ))}
                <ToastPrimitives.Viewport />
            </ToastPrimitives.Provider>
        </ToastContext.Provider>
    );
}
