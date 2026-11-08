// Чистые функции: не изменяют входной массив и не знают про HTTP.

export function selectTasks(tasks, filters) {
  const q = typeof filters.q === 'string' ? filters.q.trim().toLowerCase() : '';
  return tasks.filter(task => {
    if (filters.completed !== null && task.completed !== filters.completed) return false;
    if (filters.priority !== null && task.priority !== filters.priority) return false;
    if (filters.categoryId !== null && task.categoryId !== filters.categoryId) return false;
    if (q && !task.title.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function findTask(tasks, id) {
  return tasks.find(task => task.id === id) ?? null;
}
