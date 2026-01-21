"use client";

import { useState, useEffect } from "react";
import ReactGoogleAutocomplete from "react-google-autocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PlaceSelector({ value, onChange, onCityStateChange }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  if (!apiKey) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor="collection-local">Local Específico (Opcional)</Label>
        <Input
          id="collection-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: Parque Ibirapuera - Portão 7"
        />
        <p className="text-[10px] text-muted-foreground">
          * Para autocompletar do Google Maps, adicione
          NEXT_PUBLIC_GOOGLE_MAPS_KEY ao .env
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="collection-local">Local Específico (Google Maps)</Label>
      <ReactGoogleAutocomplete
        apiKey={apiKey}
        value={internalValue}
        onPlaceSelected={(place) => {
          const address = place.formatted_address;
          const name = place.name;
          const finalValue = name || address;

          onChange(finalValue);
          setInternalValue(finalValue);

          // Try to extract City and State to auto-fill if possible
          if (onCityStateChange && place.address_components) {
            let city = "";
            let state = "";

            place.address_components.forEach((component) => {
              if (component.types.includes("administrative_area_level_2")) {
                city = component.long_name;
              }
              if (component.types.includes("administrative_area_level_1")) {
                state = component.short_name;
              }
            });

            if (city && state) {
              onCityStateChange({ city, state });
            }
          }
        }}
        onChange={(e) => {
          setInternalValue(e.target.value);
          onChange(e.target.value);
        }}
        options={{
          types: ["establishment", "geocode"],
          componentRestrictions: { country: "br" },
        }}
        className="flex h-10 w-full max-w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Digite o nome do local..."
      />
    </div>
  );
}
