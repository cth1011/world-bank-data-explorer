import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchIndicatorData } from '@/lib/worldbank-api';
import { getCache, setCache } from '@/lib/cache';

const schema = z.object({
  code: z.string().length(3),
  indicator: z.string(),
  years: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const validation = schema.safeParse(Object.fromEntries(searchParams));
  
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: validation.error.format() }, { status: 400 });
  }

  const { code, indicator, years } = validation.data;
  const cacheKey = `indicator_${code}_${indicator}_${years}`;
  
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  try {
    const data = await fetchIndicatorData(code, indicator, years);
    setCache(cacheKey, data);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`API Error fetching indicator ${indicator} for ${code}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}