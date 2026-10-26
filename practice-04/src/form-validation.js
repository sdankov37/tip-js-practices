const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  let id;
  let title;
  let priority;

  if (editingId !== null) {
    if (typeof editingId !== "number" || !Number.isSafeInteger(editingId) || editingId <= 0) {
      errors.id = "Некорректный идентификатор редактируемой задачи";
    } else if (tasks.find((task) => task.id === editingId) === undefined) {
      errors.id = `Задача с id = ${editingId} не найдена`;
    } else {
      id = editingId;
    }
  } else {
    const raw = draft.id;
    if (typeof raw === "string" && raw.trim() === "") {
      errors.id = "Укажите идентификатор";
    } else {
      const numericId = Number(raw);
      if (!Number.isSafeInteger(numericId) || numericId <= 0) {
        errors.id = "id должен быть положительным безопасным целым числом";
      } else if (tasks.find((task) => task.id === numericId) !== undefined) {
        errors.id = `Задача с id = ${numericId} уже существует`;
      } else {
        id = numericId;
      }
    }
  }

  if (typeof draft.title !== "string") {
    errors.title = "Название должно быть строкой";
  } else {
    const trimmed = draft.title.trim();
    if (trimmed.length < 1) errors.title = "Название не должно быть пустым";
    else if (trimmed.length > 100) errors.title = "Название не должно превышать 100 символов";
    else title = trimmed;
  }

  if (typeof draft.priority !== "string" || !ALLOWED_PRIORITIES.has(draft.priority)) {
    errors.priority = "Приоритет должен быть low, medium или high";
  } else {
    priority = draft.priority;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { id, title, priority } };
}