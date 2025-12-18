"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Save, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useUser, useStackApp } from "@stackframe/stack";
import { toast } from "sonner";

export default function PhotographerProfileForm({ photographer }) {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    userId: photographer.userId,
    username: photographer.username || "",
    bio: photographer.bio || "",
    telefone: photographer.telefone || "",
    cidade: photographer.cidade || "",
    estado: photographer.estado || "",
    instagram: photographer.instagram || "",
    chavePix: photographer.chavePix || "",
    cpf: photographer.cpf || "",
    portfolioUrl: photographer.portfolioUrl || "",
    equipamentos: photographer.equipamentos || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/fotografos/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Server Error Details:", data);
        throw new Error(data.error || "Erro ao atualizar perfil");
      }

      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error("Erro ao salvar alterações");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identidade Visual</CardTitle>
          <CardDescription>
            Foto, nome e email são gerenciados pela sua conta GTClicks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage src={user.profileImageUrl} alt={user.displayName} />
              <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{user.displayName}</h3>
              <p className="text-sm text-muted-foreground">{user.primaryEmail}</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/handler/account-settings" target="_blank">
                  Alterar Foto ou Nome
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
            <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
                <CardDescription>
                    Informações exibidas publicamente no seu portfólio.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-2">
                    <Label htmlFor="bio">Bio / Sobre mim</Label>
                    <Textarea
                        id="bio"
                        placeholder="Conte um pouco sobre sua experiência..."
                        value={formData.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        rows={4}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                            id="cidade"
                            placeholder="Ex: São Paulo"
                            value={formData.cidade}
                            onChange={(e) => handleChange("cidade", e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                            id="estado"
                            placeholder="Ex: SP"
                            maxLength={2}
                            value={formData.estado}
                            onChange={(e) => handleChange("estado", e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <div className="flex">
                            <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm">@</span>
                            <Input
                                id="instagram"
                                className="rounded-l-none"
                                placeholder="seu.perfil"
                                value={formData.instagram}
                                onChange={(e) => handleChange("instagram", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="telefone">WhatsApp / Telefone</Label>
                        <Input
                            id="telefone"
                            placeholder="(00) 00000-0000"
                            value={formData.telefone}
                            onChange={(e) => handleChange("telefone", e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-2 pt-4 border-t border-border">
                    <Label htmlFor="chavePix">Dados Financeiros</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <Label htmlFor="cpf">CPF</Label>
                             <Input
                                 id="cpf"
                                 placeholder="000.000.000-00"
                                 value={formData.cpf || ''}
                                 onChange={(e) => handleChange("cpf", e.target.value)}
                             />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="chavePix">Chave Pix</Label>
                             <Input
                                 id="chavePix"
                                 placeholder="CPF, Email ou Aleatória"
                                 value={formData.chavePix}
                                 onChange={(e) => handleChange("chavePix", e.target.value)}
                             />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Esses dados são criptografados e utilizados apenas para repasses.
                    </p>
                </div>
                
                <div className="grid gap-2 pt-4 border-u border-border">
                    <Label>Profissional</Label>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="portfolio">Portfólio (Site Externo)</Label>
                          <Input
                              id="portfolio"
                              placeholder="https://..."
                              value={formData.portfolioUrl || ''}
                              onChange={(e) => handleChange("portfolioUrl", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="equipamentos">Equipamentos</Label>
                          <Textarea
                              id="equipamentos"
                              placeholder="Câmeras, Lentes..."
                              value={formData.equipamentos || ''}
                              onChange={(e) => handleChange("equipamentos", e.target.value)}
                              rows={2}
                          />
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t z-10">
                <Button type="submit" disabled={loading} size="lg">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Alterações
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
      </form>
    </div>
  );
}
