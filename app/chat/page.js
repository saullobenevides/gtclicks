import ChatInterface from '@/components/ChatInterface';

export const metadata = {
  title: 'Assistente Virtual | GTClicks',
};

export default function ChatPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Assistente GTClicks</h1>
        <p className="text-muted-foreground">
          Pergunte sobre usuários, status ou dados do sistema.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
