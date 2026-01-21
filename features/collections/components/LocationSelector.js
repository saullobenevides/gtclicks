"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

export default function LocationSelector({
  selectedState,
  selectedCity,
  onStateChange,
  onCityChange,
}) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(!!selectedState);
  const [prevSelectedState, setPrevSelectedState] = useState(selectedState);

  if (selectedState !== prevSelectedState) {
    setPrevSelectedState(selectedState);
    setCities([]);
    setLoadingCities(!!selectedState);
  }

  const [openState, setOpenState] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  // Fetch States
  useEffect(() => {
    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome",
    )
      .then((res) => res.json())
      .then((data) => {
        const formattedStates = data.map((uf) => ({
          id: uf.id,
          sigla: uf.sigla,
          nome: uf.nome,
        }));
        setStates(formattedStates);
        setLoadingStates(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar estados IBGE", err);
        setLoadingStates(false);
      });
  }, []);

  // Fetch Cities when State changes
  useEffect(() => {
    if (selectedState) {
      // setLoadingCities(true); // Removed to avoid cascading render warning
      fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`,
      )
        .then((res) => res.json())
        .then((data) => {
          const formattedCities = data.map((city) => ({
            id: city.id,
            nome: city.nome,
          }));
          setCities(formattedCities);
          setLoadingCities(false);
        })
        .catch((err) => {
          console.error("Erro ao carregar cidades IBGE", err);
          setLoadingCities(false);
        });
    }
  }, [selectedState]);

  return (
    <>
      <div className="space-y-1.5 flex flex-col">
        <Label htmlFor="location-state">Estado (UF)</Label>
        <Popover open={openState} onOpenChange={setOpenState}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openState}
              className="w-full max-w-full min-w-0 justify-between"
              disabled={loadingStates}
            >
              {selectedState
                ? states.find((state) => state.sigla === selectedState)?.nome
                : loadingStates
                  ? "Carregando..."
                  : "Selecione o estado..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-popover-trigger-width) p-0 bg-zinc-950 text-white border-zinc-800">
            <Command>
              <CommandInput placeholder="Buscar estado..." />
              <CommandList>
                <CommandEmpty>Estado não encontrado.</CommandEmpty>
                <CommandGroup>
                  {states.map((state) => (
                    <CommandItem
                      key={state.id}
                      value={state.nome} // Search by name
                      onSelect={() => {
                        const newValue =
                          state.sigla === selectedState ? "" : state.sigla;
                        onStateChange(newValue);
                        onCityChange("");
                        setOpenState(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedState === state.sigla
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {state.nome} ({state.sigla})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-1.5 flex flex-col">
        <Label htmlFor="location-city">Cidade</Label>
        <Popover open={openCity} onOpenChange={setOpenCity}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCity}
              className="w-full max-w-full min-w-0 justify-between"
              disabled={!selectedState || loadingCities}
            >
              {selectedCity
                ? selectedCity
                : loadingCities
                  ? "Carregando..."
                  : "Selecione a cidade..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-popover-trigger-width) p-0 bg-zinc-950 text-white border-zinc-800">
            <Command>
              <CommandInput placeholder="Buscar cidade..." />
              <CommandList>
                <CommandEmpty>Cidade não encontrada.</CommandEmpty>
                <CommandGroup>
                  {cities.map((city) => (
                    <CommandItem
                      key={city.id}
                      value={city.nome}
                      onSelect={(currentValue) => {
                        onCityChange(
                          currentValue === selectedCity ? "" : currentValue,
                        );
                        setOpenCity(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCity === city.nome
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {city.nome}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
