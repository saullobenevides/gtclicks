"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LocationSelector from "../LocationSelector";
import PlaceSelector from "../PlaceSelector";
import { CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";

export default function BasicDetailsTab({ collectionData, onDataChange }) {
  return (
    <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
      <CardHeader className="px-0 md:px-6 py-4 pl-4 md:py-6">
        <CardTitle>Sobre a Coleção</CardTitle>
        <CardDescription>
          Informações básicas para identificar o evento.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 w-full max-w-full min-w-0 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-4 w-full min-w-0">
          <div className="space-y-1.5 w-full min-w-0">
            <Label htmlFor="collection-name">Título da Coleção</Label>
            <Input
              id="collection-name"
              className="w-full min-w-0 h-11 bg-transparent border-2 border-border-default rounded-radius-lg"
              value={collectionData.nome}
              onChange={(e) => onDataChange("nome", e.target.value)}
              placeholder="Adicione um título para a coleção"
            />
          </div>
          <div className="space-y-1.5 w-full min-w-0">
            <Label htmlFor="collection-category">Categoria</Label>
            <Select
              value={collectionData.categoria}
              onValueChange={(value) => onDataChange("categoria", value)}
            >
              <SelectTrigger
                id="collection-category"
                className="w-full min-w-0 h-11 bg-transparent border-2 border-border-default rounded-radius-lg"
              >
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5 w-full min-w-0">
          <Label htmlFor="collection-description">Descrição</Label>
          <Textarea
            id="collection-description"
            value={collectionData.descricao}
            onChange={(e) => onDataChange("descricao", e.target.value)}
            placeholder="Conte mais sobre como foi o evento..."
            className="h-24 w-full min-w-0 bg-transparent border-2 border-border-default rounded-radius-lg"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 w-full min-w-0">
          <div className="space-y-1.5 w-full min-w-0">
            <Label htmlFor="collection-date-start">Início do Evento</Label>
            <Input
              id="collection-date-start"
              className="w-full min-w-0 h-11 bg-transparent border-2 border-border-default rounded-radius-lg date-icon-right"
              type="date"
              value={collectionData.dataInicio}
              onChange={(e) => onDataChange("dataInicio", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 w-full min-w-0">
            <Label htmlFor="collection-date-end">Fim do Evento</Label>
            <Input
              id="collection-date-end"
              className="w-full min-w-0 h-11 bg-transparent border-2 border-border-default rounded-radius-lg date-icon-right"
              type="date"
              value={collectionData.dataFim}
              onChange={(e) => onDataChange("dataFim", e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 w-full min-w-0">
          <LocationSelector
            selectedState={collectionData.estado}
            selectedCity={collectionData.cidade}
            onStateChange={(val) => onDataChange("estado", val)}
            onCityChange={(val) => onDataChange("cidade", val)}
          />
        </div>

        <div
          role="group"
          aria-labelledby="face-recognition-label"
          aria-describedby="face-recognition-desc"
          className="flex items-start gap-3 rounded-md border p-4 md:p-5 bg-primary/5 border-primary/20 min-h-[44px] touch-manipulation"
        >
          <Checkbox
            id="face-recognition"
            checked={collectionData.faceRecognitionEnabled}
            onCheckedChange={(checked) =>
              onDataChange("faceRecognitionEnabled", !!checked)
            }
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            aria-describedby="face-recognition-desc"
          />
          <div className="space-y-1 leading-none min-w-0 flex-1">
            <Label
              id="face-recognition-label"
              htmlFor="face-recognition"
              className="text-sm font-bold leading-none cursor-pointer text-white flex items-center gap-2 flex-wrap"
            >
              Ativar Reconhecimento Facial (IA)
              <span className="text-[10px] bg-primary text-black px-1.5 py-0.5 rounded-full font-black uppercase shrink-0">
                Premium
              </span>
            </Label>
            <p
              id="face-recognition-desc"
              className="text-xs text-muted-foreground"
            >
              Permite que os clientes encontrem suas fotos através de uma selfie
              utilizando IA da AWS.
            </p>
          </div>
        </div>

        {/* 
        <div className="space-y-1.5 w-full max-w-full min-w-0">
          <PlaceSelector
            value={collectionData.local}
            onChange={(val) => onDataChange("local", val)}
            onCityStateChange={({ city, state }) => {
              onDataChange("cidade", city);
              onDataChange("estado", state);
              toast.info(
                `Cidade e Estado atualizados para: ${city} - ${state}`,
              );
            }}
          />
        </div>
        */}
      </CardContent>
    </Card>
  );
}
