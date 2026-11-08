import { Router } from 'express';
import { ApiError } from './errors.js';
import { parsePositiveId, parseFilters } from './validation.js';

export function createRouter(store) {
  const router = Router({ caseSensitive: true });

  router.get('/health', (req, res) => res.json({ data: { status: 'ok' } }));

  router.get('/categories', (req, res) => {
    const categories = store.listCategories();
    res.json({ data: categories, meta: { total: categories.length } });
  });

  router.get('/tasks', (req, res) => {
    const searchParams = new URL(req.originalUrl, 'http://localhost').searchParams;
    const filters = parseFilters(searchParams);
    const tasks = store.listTasks(filters);
    res.json({ data: tasks, meta: { total: tasks.length, filters } });
  });

  router.get('/tasks/:id', (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (id === null) throw new ApiError(400, 'INVALID_ID', 'Некорректный id.');
    const task = store.getTask(id);
    if (!task) throw new ApiError(404, 'TASK_NOT_FOUND', 'Задача не найдена.', { id });
    res.json({ data: task });
  });

  // Все известные пути после GET-обработчиков: для них разрешены только чтения.
  router.all(['/health', '/categories', '/tasks', '/tasks/:id'], (req, res, next) => {
    res.set('Allow', 'GET, HEAD, OPTIONS');
    next(new ApiError(405, 'METHOD_NOT_ALLOWED', 'Метод не поддерживается.'));
  });

  return router;
}
