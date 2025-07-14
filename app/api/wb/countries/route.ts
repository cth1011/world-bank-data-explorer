import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchAllCountries } from '@/lib/worldbank-api';
import { getCache, setCache } from '@/lib/cache';
import { Country } from '@/lib/types';

const schema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const validation = schema.safeParse(Object.fromEntries(searchParams));

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: validation.error.format() }, { status: 400 });
  }

  const { page, per_page, search } = validation.data;
  const CACHE_KEY = `countries_all`;

  try {
    let allCountries: Country[] | undefined = getCache(CACHE_KEY);

    if (!allCountries) {
      allCountries = await fetchAllCountries();
      setCache(CACHE_KEY, allCountries);
    }
    
    let filteredCountries = allCountries;
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredCountries = allCountries.filter(
        country =>
          country.name.toLowerCase().includes(searchTerm) ||
          country.id.toLowerCase().includes(searchTerm) ||
          country.iso2Code.toLowerCase().includes(searchTerm)
      );
    }

    const total = filteredCountries.length;
    const start = (page - 1) * per_page;
    const end = start + per_page;
    const paginatedData = filteredCountries.slice(start, end);

    return NextResponse.json({ data: paginatedData, total });
  } catch (error) {
    console.error('API Error fetching countries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}