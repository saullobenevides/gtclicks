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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
            <Label htmlFor="collection-name">
              Título da Coleção <span className="text-primary">*</span>
            </Label>
            <Input
              id="collection-name"
              className="w-full min-w-0 h-11 bg-transparent border-2 border-border-default rounded-radius-lg"
              value={collectionData.nome}
              onChange={(e) => onDataChange("nome", e.target.value)}
              placeholder="Adicione um título para a coleção"
            />
          </div>
          <div className="space-y-1.5 w-full min-w-0">
            <Label htmlFor="collection-category">
              Categoria <span className="text-primary">*</span>
            </Label>
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

        <div className="space-y-4 w-full min-w-0">
          <div className="space-y-2">
            <Label>Duração do evento</Label>
            <RadioGroup
              value={
                collectionData.eventoDuracao ||
                (collectionData.dataFim ? "multi" : "single")
              }
              onValueChange={(v) => {
                onDataChange("eventoDuracao", v);
                onDataChange("dataFim", "");
              }}
              className="flex gap-4"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="single" id="evento-single" />
                <span className="text-sm font-medium">Dia único</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="multi" id="evento-multi" />
                <span className="text-sm font-medium">
                  Duração de vários dias
                </span>
              </label>
            </RadioGroup>
          </div>

          <div className="grid md:grid-cols-2 gap-4 w-full min-w-0">
            <div className="space-y-1.5 w-full min-w-0">
              <Label htmlFor="collection-date-start">
                {collectionData.eventoDuracao === "multi"
                  ? "Início do Evento"
                  : "Data do Evento"}
              </Label>
              <Input
                id="collection-date-start"
                className="w-full min-w-0 h-11 bg-transparent border-2 border-border-default rounded-radius-lg date-icon-right"
                type="date"
                value={collectionData.dataInicio}
                onChange={(e) => onDataChange("dataInicio", e.target.value)}
              />
            </div>
            {collectionData.eventoDuracao === "multi" ? (
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
            ) : null}
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

        {/* TODO: Reconhecimento facial desabilitado até Rekognition estar configurado
        <div role="group" ...>
          <Checkbox ... Ativar Reconhecimento Facial (IA) ... />
        </div>
        */}

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
