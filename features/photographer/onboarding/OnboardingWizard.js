"use client";

/**
 * @deprecated Onboarding inicial usa FotografoOnboarding + POST /api/fotografos/create.
 * Este componente e POST /api/fotografos/onboarding são para atualização de perfil
 * (fotógrafo já criado). Ver FLUXO_AUTH_CADASTRO.md e REVISAO_UI_UX_FLUXOS.md.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  User,
  Camera,
  Wallet,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const SPECIALTIES = [
  "Casamentos",
  "Eventos Corporativos",
  "Retratos",
  "Moda",
  "Produtos",
  "Gastronomia",
  "Esportes",
  "Natureza",
  "Arquitetura",
  "Jornalismo",
  "Ensaios",
  "Viagens",
];

export default function OnboardingWizard({ initialData = {} }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    bio: initialData.bio || "",
    cidade: initialData.cidade || "",
    estado: initialData.estado || "",
    instagram: initialData.instagram || "",
    portfolioUrl: initialData.portfolioUrl || "",
    especialidades: initialData.especialidades || [],
    equipamentos: initialData.equipamentos || "",
    cpf: initialData.cpf || "",
  });

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSpecialty = (spec) => {
    setFormData((prev) => {
      const current = prev.especialidades || [];
      if (current.includes(spec)) {
        return { ...prev, especialidades: current.filter((s) => s !== spec) };
      } else {
        return { ...prev, especialidades: [...current, spec] };
      }
    });
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.cidade || !formData.estado) {
        toast.error("Por favor, preencha sua localização (Cidade e Estado).");
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (formData.especialidades.length === 0) {
        toast.error("Selecione pelo menos uma especialidade.");
        return false;
      }
      return true;
    }
    if (currentStep === 3) {
      if (!formData.cpf) {
        toast.error("O CPF é obrigatório para sua segurança.");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/fotografos/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar perfil.");
      }

      toast.success("Perfil configurado com sucesso! Bem-vindo(a)!");
      router.push("/dashboard/fotografo");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex items-center gap-2 ${
              step >= i ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= i ? "border-primary bg-primary/10" : "border-muted"
              }`}
            >
              {step > i ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <span>{i}</span>
              )}
            </div>
            <span className="text-sm font-medium hidden sm:block">
              {i === 1 ? "Perfil" : i === 2 ? "Expertise" : "Financeiro"}
            </span>
            {i < 3 && <div className="w-8 h-px bg-muted mx-2" />}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Bem-vindo ao GTClicks! 📸</h1>
        <p className="text-muted-foreground">
          Vamos configurar seu perfil profissional em poucos passos.
        </p>
      </div>

      <StepIndicator />

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Seu Perfil Profissional"}
            {step === 2 && "Sua Expertise"}
            {step === 3 && "Dados de Recebimento"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Conte para os clientes quem você é e onde atua."}
            {step === 2 && "Destaque suas habilidades e equipamentos."}
            {step === 3 && "Informações seguras para repasse das suas vendas."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* STEP 1: PROFILE */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cidade *</Label>
                  <Input
                    value={formData.cidade}
                    onChange={(e) => updateForm("cidade", e.target.value)}
                    placeholder="Ex: São Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Input
                    value={formData.estado}
                    onChange={(e) => updateForm("estado", e.target.value)}
                    placeholder="Ex: SP"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Instagram Profissional</Label>
                <div className="flex">
                  <div className="bg-muted px-3 py-2 border rounded-l-md text-sm text-muted-foreground flex items-center">
                    @
                  </div>
                  <Input
                    className="rounded-l-none"
                    value={formData.instagram}
                    onChange={(e) => updateForm("instagram", e.target.value)}
                    placeholder="seu.perfil"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Link do Portfólio (Opcional)</Label>
                <Input
                  value={formData.portfolioUrl}
                  onChange={(e) => updateForm("portfolioUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Bio / Sobre você</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => updateForm("bio", e.target.value)}
                  placeholder="Conte brevemente sua história na fotografia..."
                  rows={4}
                />
              </div>
            </>
          )}

          {/* STEP 2: EXPERTISE */}
          {step === 2 && (
            <>
              <div className="space-y-3">
                <Label>
                  Suas Especialidades (Selecione todas que aplicar) *
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SPECIALTIES.map((spec) => (
                    <div
                      key={spec}
                      className={`cursor-pointer border rounded-md p-3 text-sm flex items-center gap-2 transition-all ${
                        formData.especialidades.includes(spec)
                          ? "bg-primary/10 border-primary text-primary font-medium"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => toggleSpecialty(spec)}
                    >
                      <Checkbox
                        checked={formData.especialidades.includes(spec)}
                      />
                      {spec}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label>Seu Equipamento Principal</Label>
                <Textarea
                  value={formData.equipamentos}
                  onChange={(e) => updateForm("equipamentos", e.target.value)}
                  placeholder="Ex: Canon R6, Lentes 24-70mm e 50mm..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Isso ajuda a passar credibilidade para grandes clientes.
                </p>
              </div>
            </>
          )}

          {/* STEP 3: FINANCIAL */}
          {step === 3 && (
            <>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-600 mb-4">
                🔒 Seus dados sensíveis são criptografados e nunca serão
                exibidos publicamente.
              </div>

              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => updateForm("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                />
                <p className="text-xs text-muted-foreground">
                  Necessário para emissão de notas fiscais de repasse.
                </p>
              </div>

              <div className="rounded-md bg-muted/50 border border-white/10 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">
                  Chave PIX (Para Recebimento)
                </p>
                <p>
                  Por segurança, cadastre sua chave PIX na página{" "}
                  <strong>Financeiro</strong> após concluir o cadastro. Será
                  necessário verificar seu email para confirmar.
                </p>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t p-6 bg-muted/5">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} disabled={loading}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          ) : (
            <div /> // Spacer
          )}

          {step < 3 ? (
            <Button onClick={handleNext} className="ml-auto">
              Próximo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white ml-auto"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Concluir Cadastro
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
