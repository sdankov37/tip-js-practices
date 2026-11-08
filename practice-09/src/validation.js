import { ApiError } from './errors.js';

const ALLOWED_PRIORITIES = new Set(['low', 'medium', 'high']);
const ALLOWED_KEYS = new Set(['completed', 'priority', 'categoryId', 'q']);

export function parsePositiveId(raw) {
  if (typeof raw !== 'string') return null;
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) return null;
  return value;
}

export function parseFilters(searchParams) {
  const result = { completed: null, priority: null, categoryId: null, q: '' };
  const seen = new Set();

  for (const [key, value] of searchParams) {
    if (!ALLOWED_KEYS.has(key)) {
      throw new ApiError(400, 'INVALID_QUERY', `Неизвестный параметр: ${key}.`);
    }
    if (seen.has(key)) {
      throw new ApiError(400, 'INVALID_QUERY', `Параметр ${key} повторяется.`);
    }
    seen.add(key);

    if (key === 'completed') {
      if (value === 'true') result.completed = true;
      else if (value === 'false') result.completed = false;
      else throw new ApiError(400, 'INVALID_QUERY', 'completed должен быть true или false.');
    } else if (key === 'priority') {
      if (!ALLOWED_PRIORITIES.has(value)) {
        throw new ApiError(400, 'INVALID_QUERY', 'priority должен быть low, medium или high.');
      }
      result.priority = value;
    } else if (key === 'categoryId') {
      const parsed = parsePositiveId(value);
      if (parsed === null) {
        throw new ApiError(400, 'INVALID_QUERY', 'categoryId должен быть положительным целым.');
      }
      result.categoryId = parsed;
    } else if (key === 'q') {
      const trimmed = value.trim();
      if (trimmed.length > 100) {
        throw new ApiError(400, 'INVALID_QUERY', 'q не должен превышать 100 символов.');
      }
      result.q = trimmed;
    }
  }

  return result;
}
