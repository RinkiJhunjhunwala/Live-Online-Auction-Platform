import { fetchJson } from './http';

export async function getItems() {
  return fetchJson('/items');
}
