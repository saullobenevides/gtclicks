"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Save, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useUser } from "@stackframe/stack";
import { toast } from "sonner";
import { updatePhotographer } from "@/actions/photographers";

const DEFAULT_VISIBILITY = {
  bio: true,
  cidade: true,
  estado: true,
  instagram: true,
  telefone: true,
  especialidades: true,
  portfolioUrl: true,
  equipamentos: true,
};

export default function PhotographerProfileForm({ photographer }) {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialVisibility =
    photographer?.visibilitySettings &&
    typeof photographer.visibilitySettings === "object"
      ? { ...DEFAULT_VISIBILITY, ...photographer.visibilitySettings }
      : DEFAULT_VISIBILITY;

  const [formData, setFormData] = useState({
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
    especialidades: photographer.especialidades || [],
    visibility: initialVisibility,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVisibilityChange = (key, checked) => {
    setFormData((prev) => ({
      ...prev,
      visibility: { ...prev.visibility, [key]: checked },
    }));
  };

  /* Refactored to use Server Action */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "especialidades" || key === "visibility") return;
        if (formData[key] !== null && formData[key] !== undefined) {
          payload.append(key, formData[key]);
        }
      });
      if (Array.isArray(formData.especialidades)) {
        formData.especialidades.forEach((spec) =>
          payload.append("especialidades", spec)
        );
      }
      payload.append(
        "visibilitySettings",
        JSON.stringify(formData.visibility || DEFAULT_VISIBILITY)
      );

      const result = await updatePhotographer(payload);

      if (result.error) {
        throw new Error(result.error);
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
      <Card className="bg-black/20 border-white/10">
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
              <p className="text-sm text-muted-foreground">
                {user.primaryEmail}
              </p>
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

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="bio">Bio / Sobre mim</Label>
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <Checkbox
                    checked={formData.visibility?.bio ?? true}
                    onCheckedChange={(c) =>
                      handleVisibilityChange("bio", c === true)
                    }
                  />
                  <span>Exibir no perfil</span>
                </label>
              </div>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre sua experiência..."
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <Checkbox
                      checked={formData.visibility?.cidade ?? true}
                      onCheckedChange={(c) =>
                        handleVisibilityChange("cidade", c === true)
                      }
                    />
                    <span>Exibir</span>
                  </label>
                </div>
                <Input
                  id="cidade"
                  placeholder="Ex: São Paulo"
                  value={formData.cidade}
                  onChange={(e) => handleChange("cidade", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="estado">Estado</Label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <Checkbox
                      checked={formData.visibility?.estado ?? true}
                      onCheckedChange={(c) =>
                        handleVisibilityChange("estado", c === true)
                      }
                    />
                    <span>Exibir</span>
                  </label>
                </div>
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
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <Checkbox
                      checked={formData.visibility?.instagram ?? true}
                      onCheckedChange={(c) =>
                        handleVisibilityChange("instagram", c === true)
                      }
                    />
                    <span>Exibir</span>
                  </label>
                </div>
                <div className="flex">
                  <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm">
                    @
                  </span>
                  <Input
                    id="instagram"
                    className="rounded-l-none"
                    placeholder="seu.perfil"
                    value={formData.instagram}
                    onChange={(e) => handleChange("instagram", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="telefone">WhatsApp / Telefone</Label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <Checkbox
                      checked={formData.visibility?.telefone ?? true}
                      onCheckedChange={(c) =>
                        handleVisibilityChange("telefone", c === true)
                      }
                    />
                    <span>Exibir</span>
                  </label>
                </div>
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={(e) => handleChange("telefone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Label htmlFor="chavePix">Dados Financeiros</Label>
                <Button
                  variant="link"
                  size="sm"
                  asChild
                  className="px-0 h-auto"
                >
                  <Link href="/dashboard/fotografo/financeiro">
                    Gerenciar Chaves e Saques
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf || ""}
                    disabled={true}
                    className="bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chavePix">Chave Pix</Label>
                  <Input
                    id="chavePix"
                    placeholder="CPF, Email ou Aleatória"
                    value={formData.chavePix}
                    disabled={true}
                    className="bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Para alterar seus dados financeiros, acesse a página Financeiro.
              </p>
            </div>

            <div className="grid gap-2 pt-4 border-t border-border">
              <Label>Profissional</Label>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Suas Especialidades</Label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                      <Checkbox
                        checked={formData.visibility?.especialidades ?? true}
                        onCheckedChange={(c) =>
                          handleVisibilityChange("especialidades", c === true)
                        }
                      />
                      <span>Exibir no perfil</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
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
                    ].map((spec) => (
                      <div
                        key={spec}
                        className={`cursor-pointer border rounded-full px-3 py-1 text-xs font-medium transition-all ${
                          (formData.especialidades || []).includes(spec)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        onClick={() => {
                          const current = formData.especialidades || [];
                          const updated = current.includes(spec)
                            ? current.filter((s) => s !== spec)
                            : [...current, spec];
                          handleChange("especialidades", updated);
                        }}
                      >
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="portfolio">Portfólio (Site Externo)</Label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                      <Checkbox
                        checked={formData.visibility?.portfolioUrl ?? true}
                        onCheckedChange={(c) =>
                          handleVisibilityChange("portfolioUrl", c === true)
                        }
                      />
                      <span>Exibir</span>
                    </label>
                  </div>
                  <Input
                    id="portfolio"
                    placeholder="https://..."
                    value={formData.portfolioUrl || ""}
                    onChange={(e) =>
                      handleChange("portfolioUrl", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="equipamentos">Equipamentos</Label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                      <Checkbox
                        checked={formData.visibility?.equipamentos ?? true}
                        onCheckedChange={(c) =>
                          handleVisibilityChange("equipamentos", c === true)
                        }
                      />
                      <span>Exibir</span>
                    </label>
                  </div>
                  <Textarea
                    id="equipamentos"
                    placeholder="Câmeras, Lentes..."
                    value={formData.equipamentos || ""}
                    onChange={(e) =>
                      handleChange("equipamentos", e.target.value)
                    }
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t border-white/10 z-10">
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
