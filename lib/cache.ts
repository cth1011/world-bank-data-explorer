import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

export function getCache<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, data);
}