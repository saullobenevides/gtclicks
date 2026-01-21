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
    <Card>
      <CardHeader>
        <CardTitle>Sobre a Coleção</CardTitle>
        <CardDescription>
          Informações básicas para identificar o evento.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="collection-name">Título da Coleção</Label>
            <Input
              id="collection-name"
              value={collectionData.nome}
              onChange={(e) => onDataChange("nome", e.target.value)}
              placeholder="Ex: Corrida 5k Santos / Ensaio Fotográfico"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="collection-category">Categoria</Label>
            <Select
              value={collectionData.categoria}
              onValueChange={(value) => onDataChange("categoria", value)}
            >
              <SelectTrigger id="collection-category">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="collection-date-start">Início do Evento</Label>
            <Input
              id="collection-date-start"
              type="date"
              value={collectionData.dataInicio}
              onChange={(e) => onDataChange("dataInicio", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="collection-date-end">Fim do Evento</Label>
            <Input
              id="collection-date-end"
              type="date"
              value={collectionData.dataFim}
              onChange={(e) => onDataChange("dataFim", e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <LocationSelector
            selectedState={collectionData.estado}
            selectedCity={collectionData.cidade}
            onStateChange={(val) => onDataChange("estado", val)}
            onCityChange={(val) => onDataChange("cidade", val)}
          />
        </div>

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

        <div className="space-y-1.5">
          <Label htmlFor="collection-description">Descrição</Label>
          <Textarea
            id="collection-description"
            value={collectionData.descricao}
            onChange={(e) => onDataChange("descricao", e.target.value)}
            placeholder="Conte mais sobre como foi o evento..."
            className="h-24"
          />
        </div>
      </CardContent>
    </Card>
  );
}
