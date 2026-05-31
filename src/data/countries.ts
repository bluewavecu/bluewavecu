export type CountryOption = {
  code: string;
  name: string;
};

let cachedCountries: CountryOption[] | null = null;

export function getAllCountries(): CountryOption[] {
  if (cachedCountries) {
    return cachedCountries;
  }

  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  const countries: CountryOption[] = [];

  for (let first = 65; first <= 90; first += 1) {
    for (let second = 65; second <= 90; second += 1) {
      const code = String.fromCharCode(first) + String.fromCharCode(second);
      const name = regionNames.of(code);

      if (name && name !== code) {
        countries.push({ code, name });
      }
    }
  }

  cachedCountries = countries.sort((left, right) => left.name.localeCompare(right.name));
  return cachedCountries;
}

export function getCountryName(code: string) {
  return getAllCountries().find((country) => country.code === code)?.name ?? code;
}
