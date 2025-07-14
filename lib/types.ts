
export interface Country {
    id: string;
    iso2Code: string;
    name: string;
    region: string;
    incomeLevel: string;
  }
  
  export interface IndicatorDataPoint {
  country: { id: string; value: string };
  date: string;
  value: number | null;
}

  export interface WBCountry {
    id: string;
    iso2Code: string;
    name: string;
    region: {
      id: string;
      iso2code: string;
      value: string;
    };
    incomeLevel: {
      id: string;
      iso2code: string;
      value: string;
    };
    capitalCity: string;
  }
  
  export interface WBIndicator {
    indicator: {
      id: string;
      value: string;
    };
    country: {
      id: string;
      value: string;
    };
    countryiso3code: string;
    date: string;
    value: number | null;
    unit: string;
    obs_status: string;
    decimal: number;
  }