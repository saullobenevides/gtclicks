'use client';

import { useState } from 'react';
import { useUser } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    chavePix: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/fotografos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: user.name || formData.username,
          email: user.email,
          ...formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar perfil');
      }

      router.push('/dashboard/fotografo');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Bem-vindo ao GT Clicks!</CardTitle>
          <CardDescription>
            Complete seu perfil de fotógrafo para começar a vender.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <Label htmlFor="username">
                Nome de Usuário (URL do seu perfil)
              </Label>
              <Input
                id="username"
                type="text"
                required
                placeholder="ex: joaosilva"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                pattern="[a-z0-9-]+"
                title="Apenas letras minúsculas, números e hífens"
              />
              <p className="text-sm text-muted-foreground">
                Seu perfil será: gtclicks.com/fotografo/
                <strong>{formData.username || 'seu-usuario'}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Opcional)</Label>
              <Textarea
                id="bio"
                rows="3"
                placeholder="Conte um pouco sobre seu trabalho..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chavePix">
                Chave PIX (Para receber pagamentos)
              </Label>
              <Input
                id="chavePix"
                type="text"
                required
                placeholder="CPF, Email, Telefone ou Chave Aleatória"
                value={formData.chavePix}
                onChange={(e) =>
                  setFormData({ ...formData, chavePix: e.target.value })
                }
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Criando Perfil...' : 'Concluir Cadastro'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
