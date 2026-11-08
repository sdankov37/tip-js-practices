import { useState } from 'react';
import { validateTaskDraft } from '../domain/task-service.js';

export default function TaskForm({ categories, initialTask = null, onSave, onCancel }) {
  const empty = () => ({
    title: '',
    priority: 'medium',
    categoryId: String(categories[0]?.id ?? ''),
  });
  const [draft, setDraft] = useState(() => initialTask
    ? {
        title: initialTask.title,
        priority: initialTask.priority,
        categoryId: String(initialTask.categoryId),
      }
    : empty());
  const [errors, setErrors] = useState({});

  function change(event) {
    setDraft(prev => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function submit(event) {
    event.preventDefault();
    const result = validateTaskDraft(draft, categories);
    setErrors(result.errors);
    if (!result.valid) return;
    const saved = onSave(result.value);
    if (saved && !initialTask) setDraft(empty());
  }

  return (
    <section aria-label="Форма задачи">
      <h2>{initialTask ? 'Редактирование' : 'Новая задача'}</h2>
      <form onSubmit={submit} noValidate>
        <label htmlFor="title">Название</label>
        <input
          id="title"
          name="title"
          value={draft.title}
          onChange={change}
          aria-invalid={Boolean(errors.title)}
          aria-describedby="title-error"
        />
        <p id="title-error" className="error">{errors.title}</p>

        <label htmlFor="priority">Приоритет</label>
        <select
          id="priority"
          name="priority"
          value={draft.priority}
          onChange={change}
          aria-invalid={Boolean(errors.priority)}
          aria-describedby="priority-error"
        >
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
        <p id="priority-error" className="error">{errors.priority}</p>

        <label htmlFor="categoryId">Категория</label>
        <select
          id="categoryId"
          name="categoryId"
          value={draft.categoryId}
          onChange={change}
          aria-invalid={Boolean(errors.categoryId)}
          aria-describedby="category-error"
        >
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <p id="category-error" className="error">{errors.categoryId}</p>

        <button type="submit">{initialTask ? 'Сохранить' : 'Добавить'}</button>
        {initialTask && <button type="button" onClick={onCancel}>Отмена</button>}
      </form>
    </section>
  );
}
