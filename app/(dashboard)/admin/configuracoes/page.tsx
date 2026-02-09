"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";
import { getAdminConfig, updateAdminConfig } from "@/actions/admin";

export default function AdminConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    minSaque: "",
    taxaPlataforma: "",
  });
  const [message, setMessage] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });

  useEffect(() => {
    getAdminConfig()
      .then((result) => {
        if (result.data) {
          setConfig({
            minSaque: result.data.MIN_SAQUE_BRL || "50",
            taxaPlataforma: result.data.TAXA_PLATAFORMA_PCT || "15",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateAdminConfig({
        minSaque: Number(config.minSaque),
        taxaPlataforma: Number(config.taxaPlataforma),
      });

      if (result.success) {
        setMessage({ type: "success", text: "Configurações salvas!" });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erro ao salvar",
        });
      }
    } catch (err) {
      console.log(err);
      setMessage({ type: "error", text: "Erro ao salvar" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Carregando...</div>;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Configurações da Plataforma
        </h1>
        <p className="text-muted-foreground">
          Defina taxas e limites globais do sistema.
        </p>
      </div>

      {message.text && (
        <Alert
          variant={message.type === "error" ? "destructive" : "default"}
          className={
            message.type === "success"
              ? "border-green-500/50 bg-green-500/10 text-green-500"
              : ""
          }
        >
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>
            {message.type === "error" ? "Erro" : "Sucesso"}
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle>Financeiro Global</CardTitle>
          <CardDescription>
            Afeta todos os fotógrafos e vendas novas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-white">Taxa da Plataforma (%)</Label>
              <Input
                value={config.taxaPlataforma}
                onChange={(e) =>
                  setConfig({ ...config, taxaPlataforma: e.target.value })
                }
                type="number"
                placeholder="15"
                className="bg-black/40 border-white/10"
              />
              <p className="text-xs text-muted-foreground">
                Porcentagem descontada de cada venda.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Saque Mínimo (R$)</Label>
              <Input
                value={config.minSaque}
                onChange={(e) =>
                  setConfig({ ...config, minSaque: e.target.value })
                }
                type="number"
                placeholder="50.00"
                className="bg-black/40 border-white/10"
              />
              <p className="text-xs text-muted-foreground">
                Valor mínimo para solicitar saque.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full md:w-auto"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
