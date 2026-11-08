// Вариант 2 — «Подготовка выступления», начальный фильтр «Выполненные».
export const variant = 2;
export function createInitialFilters() {
  const presets = [
    { completed: 'false' }, { completed: 'true' },
    { priority: 'high' }, { priority: 'medium' },
    { categoryId: '1' }, { categoryId: '2' },
    { q: 'провер' }, { completed: 'false', priority: 'high', categoryId: '2' },
  ];
  return { q: '', completed: '', priority: '', categoryId: '', ...presets[((variant - 1) % 8 + 8) % 8] };
}
