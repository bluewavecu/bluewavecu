"use client";

import { getAllCountries } from "@/data/countries";
import { cn } from "@/lib/utils";

type CountrySelectProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  id?: string;
};

export function CountrySelect({
  value,
  onChange,
  required = false,
  className,
  id = "bank-country",
}: CountrySelectProps) {
  const countries = getAllCountries();

  return (
    <select
      id={id}
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(className)}
    >
      <option value="">Select country</option>
      {countries.map((country) => (
        <option key={country.code} value={country.name}>
          {country.name}
        </option>
      ))}
    </select>
  );
}
