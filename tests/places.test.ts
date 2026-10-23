import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { searchShard, shardFor, type PlaceShard } from '@/engine/places';

const search = (query: string) => {
  const shard = JSON.parse(fs.readFileSync(`public/places/${shardFor(query)}.json`, 'utf8')) as PlaceShard;
  return searchShard(shard, query);
};

describe('place search', () => {
  it.each(['Sonipat', 'Rohtak', 'Hisar', 'Karnal', 'Panipat', 'Jind', 'Gohana', 'Bahadurgarh'])(
    'finds %s in Haryana with its time zone', (town) => {
      const [top] = search(town);
      expect(top).toMatchObject({ name: town, state: 'Haryana', country: 'India', zone: 'Asia/Kolkata' });
    });

  it('tolerates typos and finds old names', () => {
    expect(search('Sonepat')[0].name).toBe('Sonipat');
    expect(search('Rohtk')[0].name).toBe('Rohtak');
    expect(search('Varansi')[0].name).toBe('Varanasi');
    expect(search('Bombay')[0].name).toBe('Mumbai');
    expect(search('Gurgaon')[0].name).toBe('Gurugram');
    expect(search('Calcutta')[0].name).toBe('Kolkata');
  });

  it('matches prefixes, larger places first', () => {
    const results = search('Hyder');
    expect(results[0]).toMatchObject({ name: 'Hyderabad', state: 'Telangana' });
  });

  it('narrows by state or country after a comma', () => {
    expect(search('Hyderabad, Pakistan')[0]).toMatchObject({ name: 'Hyderabad', country: 'Pakistan' });
    expect(search('Aurangabad, Bihar')[0]).toMatchObject({ name: 'Aurangabad', state: 'Bihar' });
  });

  it('keeps diacritics outside India and matches without them', () => {
    expect(search('Sao Paulo')[0].name).toBe('São Paulo');
    expect(search('Zurich')[0].zone).toBe('Europe/Zurich');
  });

  it('returns nothing for an empty query', () => {
    expect(shardFor('  ')).toBeNull();
  });
});
