import { Country, IndicatorDataPoint, WBCountry, WBIndicator } from './types';

const API_BASE_URL = 'https://api.worldbank.org/v2';

export async function fetchAllCountries(): Promise<Country[]> {
  const url = `${API_BASE_URL}/country?format=json&per_page=350`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch countries from World Bank API');
  }

  const data = await response.json();
  const [, countriesData] = data;

  if (!Array.isArray(countriesData)) {
    return [];
  }
  
  const validCountries: Country[] = countriesData
    .filter((country: WBCountry) => country.iso2Code && country.region.value !== 'Aggregates')
    .map((country: WBCountry) => ({
      id: country.id,
      iso2Code: country.iso2Code,
      name: country.name,
      region: country.region.value,
      incomeLevel: country.incomeLevel.value,
    }));
    
  return validCountries;
}


export async function fetchIndicatorData(
  countryCode: string,
  indicatorCode: string,
  years: number
): Promise<IndicatorDataPoint[]> {
  const currentDate = new Date().getFullYear();
  const dateRange = `${currentDate - years}:${currentDate}`;

  const url = `${API_BASE_URL}/country/${countryCode}/indicator/${indicatorCode}?format=json&date=${dateRange}&per_page=${years}`;
  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    throw new Error(`Failed to fetch indicator ${indicatorCode}`);
  }

  const data = await response.json();
  const [, indicatorData] = data;
  
  if (!Array.isArray(indicatorData)) {
    return [];
  }

  return indicatorData.map((point: WBIndicator) => ({
    country: point.country,
    date: point.date,
    value: point.value,
  }));
}