
import { NextRequest, NextResponse } from 'next/server';
import { fetchIndicatorData } from '@/lib/worldbank-api';
import { IndicatorDataPoint } from '@/lib/types';

const mergeIndicatorData = (popData: IndicatorDataPoint[], gdpData: IndicatorDataPoint[]) => {
  const dataMap = new Map<number, { year: number; population: number | null; gdp: number | null }>();

  popData.forEach(d => {
    if (d.date && d.value !== null) {
      const year = parseInt(d.date, 10);
      dataMap.set(year, { year, population: d.value, gdp: null });
    }
  });

  gdpData.forEach(d => {
    if (d.date && d.value !== null) {
      const year = parseInt(d.date, 10);
      const existing = dataMap.get(year) || { year, population: null, gdp: null };
      dataMap.set(year, { ...existing, gdp: d.value });
    }
  });

  return Array.from(dataMap.values()).sort((a, b) => b.year - a.year);
};

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  const { code } = params;

  if (!code) {
    return NextResponse.json({ error: 'Country code is required' }, { status: 400 });
  }

  try {

    const [popResult, gdpResult] = await Promise.allSettled([
      fetchIndicatorData(code, "SP.POP.TOTL", 10),
      fetchIndicatorData(code, "NY.GDP.PCAP.CD", 10),
    ]);

    const populationData = popResult.status === 'fulfilled' ? popResult.value : [];
    const gdpData = gdpResult.status === 'fulfilled' ? gdpResult.value : [];

    if (populationData.length === 0 && gdpData.length === 0) {
      return NextResponse.json({ error: 'No data found for this country' }, { status: 404 });
    }

    const countryName = 
      populationData?.[0]?.country?.value ?? 
      gdpData?.[0]?.country?.value ?? 
      code;
    const mergedData = mergeIndicatorData(populationData, gdpData);

    return NextResponse.json({ countryName, data: mergedData });

  } catch (error) {
    console.error(`API Error fetching country data for ${code}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
