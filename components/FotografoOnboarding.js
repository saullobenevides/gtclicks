'use client';

import { useState } from 'react';
import { useUser } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle2, User, MapPin, Camera, DollarSign, ArrowRight, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const STEPS = [
  { id: 1, title: 'Identidade', icon: User },
  { id: 2, title: 'Contato & Local', icon: MapPin },
  { id: 3, title: 'Financeiro', icon: DollarSign },
];

export default function FotografoOnboarding({ onSuccess }) {
  const user = useUser({ or: 'anonymous' });
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    username: '',
    bio: '',
    telefone: '',
    cidade: '',
    estado: '',
    instagram: '',
    chavePix: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/fotografos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: formData.name,
          email: user.primaryEmail,
          username: formData.username,
          bio: formData.bio,
          telefone: formData.telefone,
          cidade: formData.cidade,
          estado: formData.estado,
          instagram: formData.instagram,
          chavePix: formData.chavePix,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Erro ao criar perfil');
      
      if (onSuccess) onSuccess(data.data);
      
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (currentStep === 1) return formData.name && formData.username && formData.username.length >= 3;
    if (currentStep === 2) return formData.cidade && formData.estado;
    if (currentStep === 3) return formData.chavePix;
    return false;
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-10">
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10" />
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center bg-background px-2">
                <div 
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                    ${isActive ? 'border-primary bg-primary text-primary-foreground' : 
                      isCompleted ? 'border-primary bg-primary/20 text-primary' : 'border-muted bg-muted text-muted-foreground'}
                  `}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-sm mt-2 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Vamos criar sua identidade"}
            {currentStep === 2 && "Onde seus clientes te encontram?"}
            {currentStep === 3 && "Como você quer receber?"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Escolha como você será visto no marketplace."}
            {currentStep === 2 && "Facilite o contato para trabalhos extras."}
            {currentStep === 3 && "Sua chave Pix para receber pelas vendas."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {currentStep === 1 && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Nome de Exibição</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => handleChange('name', e.target.value)} 
                  placeholder="Ex: João Silva Fotografia"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username (URL do perfil)</Label>
                <div className="flex">
                  <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm">
                    gtclicks.com/@
                  </span>
                  <Input 
                    id="username" 
                    className="rounded-l-none" 
                    value={formData.username} 
                    onChange={(e) => handleChange('username', e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                    placeholder="joaosilva"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio Curta (Opcional)</Label>
                <Textarea 
                  id="bio" 
                  value={formData.bio} 
                  onChange={(e) => handleChange('bio', e.target.value)} 
                  placeholder="Conte um pouco sobre seu estilo (opcional)..."
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="telefone">WhatsApp / Telefone</Label>
                <Input 
                  id="telefone" 
                  value={formData.telefone} 
                  onChange={(e) => handleChange('telefone', e.target.value)} 
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input 
                    id="cidade" 
                    value={formData.cidade} 
                    onChange={(e) => handleChange('cidade', e.target.value)} 
                    placeholder="Ex: São Paulo"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input 
                    id="estado" 
                    value={formData.estado} 
                    onChange={(e) => handleChange('estado', e.target.value)} 
                    placeholder="Ex: SP"
                    maxLength={2}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="flex">
                  <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm">
                    instagram.com/
                  </span>
                  <Input 
                    id="instagram" 
                    className="rounded-l-none" 
                    value={formData.instagram} 
                    onChange={(e) => handleChange('instagram', e.target.value)} 
                    placeholder="seu_perfil"
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="chavePix">Chave Pix</Label>
                <Input 
                  id="chavePix" 
                  value={formData.chavePix} 
                  onChange={(e) => handleChange('chavePix', e.target.value)} 
                  placeholder="CPF, Email, Telefone ou Aleatória"
                />
                <p className="text-xs text-muted-foreground">
                  É para onde enviaremos seus ganhos. Verifique com atenção.
                </p>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={currentStep === 1 || loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button 
            onClick={handleNext} 
            disabled={!isStepValid() || loading}
            className="w-32"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              currentStep === 3 ? 'Finalizar' : (
                <>
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
