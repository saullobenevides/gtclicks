'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log exception to server
    const logErrorToServer = async () => {
        try {
            await fetch('/api/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: error.message,
                    stack: error.stack,
                    url: window.location.href
                }),
            });
        } catch (e) {
            console.error('Failed to report error:', e);
        }
    };
    
    console.error('Application Error:', error);
    logErrorToServer();
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
            </div>
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight">Algo deu errado!</h2>
        <p className="text-muted-foreground">
          Encontramos um erro inesperado. Nossa equipe já foi notificada.
        </p>

        <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-md text-left overflow-auto max-h-32">
            <code className="text-xs text-red-200 font-mono break-all">
                {error.message || 'Erro desconhecido'}
            </code>
        </div>
        
        <div className="flex gap-4 justify-center">
            <Button 
                onClick={() => reset()}
                variant="default"
            >
                Tentar novamente
            </Button>
            <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
            >
                Voltar ao início
            </Button>
        </div>
      </div>
    </div>
  );
}
