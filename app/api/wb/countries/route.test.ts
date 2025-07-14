import { describe, it, expect, vi } from 'vitest';
import { GET } from './route' 
import { NextRequest } from 'next/server';
import * as worldbankApi from '@/lib/worldbank-api';
import { Country } from '@/lib/types';

vi.mock('@/lib/worldbank-api', () => ({
    fetchAllCountries: vi.fn(),
}));

vi.mock('@/lib/cache', () => ({
    getCache: vi.fn(() => undefined),
    setCache: vi.fn(),
}));

const mockCountries: Country[] = [
    {
        id: 'AFG',
        name: 'Afghanistan',
        iso2Code: 'AF',
        region: 'South Asia',
        incomeLevel: 'Low income',
    },
    {
        id: 'DE',
        iso2Code: 'DE',
        name: 'Germany',
        region: 'Europe',
        incomeLevel: 'High income',
    },
    {
        id: 'USA',
        iso2Code: 'US',
        name: 'United States',
        region: 'North America',
        incomeLevel: 'High income',
    },
];

describe('API Route: /api/wb/countries', () => {
    it('should return a list of countries on successful fetch', async () => {
        vi.mocked(worldbankApi.fetchAllCountries).mockResolvedValue(mockCountries);
        const request = new NextRequest('http://localhost:3000/api/wb/countries');

        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.data).toEqual(mockCountries);
        expect(body.total).toBe(mockCountries.length);
    });

    it('should return filtered countries if search query is provided', async () => {
        vi.mocked(worldbankApi.fetchAllCountries).mockResolvedValue(mockCountries);
        const request = new NextRequest('http://localhost:3000/api/wb/countries?search=Germany');

        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.data).toHaveLength(1);
        expect(body.data[0].name).toBe('Germany');
        expect(body.total).toBe(1);
    });

    it('should return an 400 Bad Request for invalid query', async () => {
        const request = new NextRequest('http://localhost:3000/api/wb/countries?page=-1');

        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe('Invalid query parameters');
    });

    it('should handle API failures gracefully', async() => {
        vi.mocked(worldbankApi.fetchAllCountries).mockRejectedValue(new Error ('API Failure'));
        const request = new NextRequest('http://localhost/api/wb/countries');

        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe('Internal Server Error');
    })
});