"use client";

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTRIES, getCitiesForCountry, formatSigningLocation } from '@/lib/contract-data';

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
}

export function LocationSelector({ value, onChange, label, description }: LocationSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [customCity, setCustomCity] = useState<string>('');
  const [cities, setCities] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Parse existing value - solo una vez al montar
  useEffect(() => {
    if (value && !isInitialized) {
      const parts = value.split(',').map(p => p.trim());
      if (parts.length === 2) {
        setSelectedCity(parts[0]);
        setSelectedCountry(parts[1]);
      }
      setIsInitialized(true);
    } else if (!value && !isInitialized) {
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Update cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryCities = getCitiesForCountry(selectedCountry);
      setCities(countryCities);
      
      // If current city is not in the list, clear it
      if (selectedCity && !countryCities.includes(selectedCity)) {
        setSelectedCity('');
        setCustomCity('');
      }
    }
  }, [selectedCountry]);

  // Update parent value when city or country changes
  useEffect(() => {
    if (selectedCountry && (selectedCity || customCity)) {
      const city = selectedCity === 'custom' ? customCity : selectedCity;
      if (city) {
        onChange(formatSigningLocation(city, selectedCountry));
      }
    }
  }, [selectedCountry, selectedCity, customCity, onChange]);

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Country Selector */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">País</Label>
          <Select value={selectedCountry || ''} onValueChange={setSelectedCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un país" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Selector */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Ciudad</Label>
          {selectedCountry ? (
            cities.length > 0 ? (
              <Select value={selectedCity || ''} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">✏️ Otra ciudad...</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Escribe la ciudad"
                value={customCity || ''}
                onChange={(e) => {
                  setCustomCity(e.target.value);
                  setSelectedCity('custom');
                }}
              />
            )
          ) : (
            <Input placeholder="Primero selecciona un país" disabled value="" />
          )}
        </div>
      </div>

      {/* Custom city input */}
      {selectedCity === 'custom' && cities.length > 0 && (
        <Input
          placeholder="Escribe el nombre de la ciudad"
          value={customCity || ''}
          onChange={(e) => setCustomCity(e.target.value)}
        />
      )}

      {/* Preview */}
      {selectedCountry && (selectedCity || customCity) && (
        <div className="text-sm text-muted-foreground bg-muted/30 rounded-md p-2">
          📍 Ubicación: <span className="font-medium text-foreground">
            {formatSigningLocation(
              selectedCity === 'custom' ? customCity : selectedCity,
              selectedCountry
            )}
          </span>
        </div>
      )}

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
