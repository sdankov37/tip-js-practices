// Чистые функции: без React, DOM, сети, случайных значений и изменения аргументов.

const PRIORITIES = ['low', 'medium', 'high'];

export function validateTaskDraft(draft, categories) {
  const value = {
    title: typeof draft.title === 'string' ? draft.title.trim() : '',
    priority: draft.priority,
    categoryId: Number(draft.categoryId),
  };
  const errors = {};

  if (typeof draft.title !== 'string' || !value.title || value.title.length > 100) {
    errors.title = 'Название: от 1 до 100 символов.';
  }
  if (!PRIORITIES.includes(value.priority)) {
    errors.priority = 'Выберите приоритет.';
  }
  if (!Number.isSafeInteger(value.categoryId)
      || !Array.isArray(categories)
      || !categories.some(c => c.id === value.categoryId)) {
    errors.categoryId = 'Выберите категорию.';
  }

  return { valid: Object.keys(errors).length === 0, value, errors };
}

export function selectTasks(tasks, filters) {
  const q = typeof filters.q === 'string' ? filters.q.trim().toLowerCase() : '';
  const completed = filters.completed === 'true' ? true
    : filters.completed === 'false' ? false : null;
  const priority = PRIORITIES.includes(filters.priority) ? filters.priority : null;
  const rawCategory = filters.categoryId;
  const categoryId = (rawCategory === '' || rawCategory === undefined || rawCategory === null)
    ? null : Number(rawCategory);

  return tasks.filter(task => {
    if (completed !== null && task.completed !== completed) return false;
    if (priority !== null && task.priority !== priority) return false;
    if (categoryId !== null && Number.isSafeInteger(categoryId) && task.categoryId !== categoryId) return false;
    if (q && !task.title.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  let completed = 0;
  for (const task of tasks) if (task.completed) completed += 1;
  return { total, completed, active: total - completed };
}

export function addTask(tasks, value, id) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new TypeError('id должен быть положительным целым.');
  if (tasks.some(task => task.id === id)) throw new Error(`Задача с id ${id} уже существует.`);
  return [...tasks, {
    id,
    title: value.title,
    priority: value.priority,
    categoryId: value.categoryId,
    completed: false,
  }];
}

export function updateTask(tasks, id, value) {
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return tasks;
  const next = tasks.slice();
  next[index] = {
    ...tasks[index],
    title: value.title,
    priority: value.priority,
    categoryId: value.categoryId,
  };
  return next;
}

export function toggleTask(tasks, id) {
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return tasks;
  const next = tasks.slice();
  next[index] = { ...tasks[index], completed: !tasks[index].completed };
  return next;
}

export function removeTask(tasks, id) {
  if (!tasks.some(task => task.id === id)) return tasks;
  return tasks.filter(task => task.id !== id);
}
