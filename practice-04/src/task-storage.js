export const STORAGE_VERSION = 1;

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

function isValidId(id) {
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0;
}

function isValidTitle(title) {
  if (typeof title !== "string") return false;
  const trimmed = title.trim();
  return trimmed.length >= 1 && trimmed.length <= 100;
}

function isValidTask(task) {
  if (!task || typeof task !== "object") return false;
  if (!isValidId(task.id)) return false;
  if (!isValidTitle(task.title)) return false;
  if (typeof task.completed !== "boolean") return false;
  if (typeof task.priority !== "string" || !ALLOWED_PRIORITIES.has(task.priority)) return false;
  return true;
}

export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;
  const seen = new Set();
  for (const task of value) {
    if (!isValidTask(task)) return false;
    if (seen.has(task.id)) return false;
    seen.add(task.id);
  }
  return true;
}

const cloneTasks = (tasks) => tasks.map((task) => ({ ...task }));

export function loadTasks(storage, key, fallbackTasks) {
  const fallback = cloneTasks(fallbackTasks);
  let raw;
  try {
    raw = storage.getItem(key);
  } catch (error) {
    return { ok: false, source: "fallback", tasks: fallback, error: `Не удалось прочитать хранилище: ${error.message}` };
  }
  if (raw === null) return { ok: true, source: "initial", tasks: fallback };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return { ok: false, source: "fallback", tasks: fallback, error: `Сохранённые данные повреждены: ${error.message}` };
  }

  if (!parsed || typeof parsed !== "object") {
    return { ok: false, source: "fallback", tasks: fallback, error: "Сохранённые данные имеют неверный формат" };
  }
  if (parsed.version !== STORAGE_VERSION) {
    return { ok: false, source: "fallback", tasks: fallback, error: `Неизвестная версия данных: ${parsed.version}` };
  }
  if (!isValidTaskList(parsed.tasks)) {
    return { ok: false, source: "fallback", tasks: fallback, error: "Сохранённые задачи не соответствуют схеме" };
  }
  return { ok: true, source: "storage", tasks: cloneTasks(parsed.tasks) };
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) return { ok: false, error: "Некорректный список задач" };
  try {
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось сохранить данные: ${error.message}` };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось удалить данные: ${error.message}` };
  }
}