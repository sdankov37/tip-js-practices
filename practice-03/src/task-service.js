// Прикладной модуль работы с задачами.
// Не содержит console.log, не импортирует demoTasks, не хранит глобального
// изменяемого списка. DOM-обращений здесь нет.

const ALLOWED_PRIORITIES = ["low", "medium", "high"];

function isValidId(id) {
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0;
}

function normalizeTitle(title) {
  if (typeof title !== "string") {
    return { ok: false, error: "Название должно быть строкой" };
  }
  const trimmed = title.trim();
  if (trimmed.length < 1) {
    return { ok: false, error: "Название не должно быть пустым" };
  }
  if (trimmed.length > 100) {
    return { ok: false, error: "Название не должно превышать 100 символов" };
  }
  return { ok: true, title: trimmed };
}

function isValidPriority(priority) {
  return typeof priority === "string" && ALLOWED_PRIORITIES.includes(priority);
}

export function createTask(id, title, priority = "medium") {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным безопасным целым числом" };
  }
  const titleResult = normalizeTitle(title);
  if (!titleResult.ok) return titleResult;
  if (!isValidPriority(priority)) {
    return { ok: false, error: "priority должен быть одним из: low, medium, high" };
  }
  return {
    ok: true,
    task: { id, title: titleResult.title, completed: false, priority },
  };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  let completed = 0;
  for (const task of tasks) {
    if (task.completed === true) completed += 1;
  }
  const pending = total - completed;
  const progress = total === 0 ? 0 : completed / total * 100;
  return { total, completed, pending, progress };
}

export function addTask(tasks, id, title, priority = "medium") {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным безопасным целым числом" };
  }
  if (tasks.find((task) => task.id === id) !== undefined) {
    return { ok: false, error: `Задача с id = ${id} уже существует` };
  }
  const created = createTask(id, title, priority);
  if (!created.ok) return created;
  return { ok: true, tasks: [...tasks, created.task] };
}

export function setTaskCompleted(tasks, id, completed) {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным безопасным целым числом" };
  }
  if (typeof completed !== "boolean") {
    return { ok: false, error: "completed должен быть логическим значением" };
  }
  const found = tasks.find((task) => task.id === id);
  if (found === undefined) {
    return { ok: false, error: `Задача с id = ${id} не найдена` };
  }
  const updated = tasks.map((task) =>
    task.id === id ? { ...task, completed } : task
  );
  return { ok: true, tasks: updated };
}

export function renameTask(tasks, id, title) {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным безопасным целым числом" };
  }
  const titleResult = normalizeTitle(title);
  if (!titleResult.ok) return titleResult;
  const found = tasks.find((task) => task.id === id);
  if (found === undefined) {
    return { ok: false, error: `Задача с id = ${id} не найдена` };
  }
  const updated = tasks.map((task) =>
    task.id === id ? { ...task, title: titleResult.title } : task
  );
  return { ok: true, tasks: updated };
}

export function removeTask(tasks, id) {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным безопасным целым числом" };
  }
  const found = tasks.find((task) => task.id === id);
  if (found === undefined) {
    return { ok: false, error: `Задача с id = ${id} не найдена` };
  }
  const updated = tasks.filter((task) => task.id !== id);
  return { ok: true, tasks: updated };
}