import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

export function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

function normalizeFilters(filters) {
  if (filters === undefined) return {};
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    throw new TypeError("filters должен быть объектом");
  }

  const result = {};
  for (const [name, value] of Object.entries(filters)) {
    if (!ALLOWED_FILTERS.has(name)) {
      throw new TypeError(`Неизвестный фильтр: ${name}`);
    }
    if (value === undefined) continue;

    if (name === "completed") {
      if (typeof value !== "boolean") throw new TypeError("completed должен быть boolean");
      result.completed = value;
    } else if (name === "priority") {
      if (typeof value !== "string" || !ALLOWED_PRIORITIES.has(value)) {
        throw new TypeError("priority должен быть low, medium или high");
      }
      result.priority = value;
    } else if (name === "categoryId") {
      if (!isPositiveSafeInteger(value)) {
        throw new TypeError("categoryId должен быть положительным безопасным целым");
      }
      result.categoryId = value;
    } else if (name === "q") {
      if (typeof value !== "string") throw new TypeError("q должен быть строкой");
      const trimmed = value.trim();
      if (trimmed.length > 100) throw new TypeError("q не должен превышать 100 символов");
      if (trimmed.length > 0) result.q = trimmed;
    }
  }
  return result;
}

function validateTaskCollection(payload) {
  const tasks = payload?.data;
  if (!Array.isArray(tasks)) throw invalidResponse("Список задач должен быть массивом");
  const seen = new Set();
  for (const task of tasks) {
    if (!isTask(task)) throw invalidResponse("Задача не соответствует схеме");
    if (seen.has(task.id)) throw invalidResponse(`Повторяющийся id задачи: ${task.id}`);
    seen.add(task.id);
  }
  const total = payload.meta?.total;
  if (total !== tasks.length) {
    throw invalidResponse(`meta.total (${total}) не совпадает с длиной data (${tasks.length})`);
  }
  return { tasks, meta: payload.meta };
}

function validateCategoryCollection(payload) {
  const categories = payload?.data;
  if (!Array.isArray(categories)) throw invalidResponse("Список категорий должен быть массивом");
  const seen = new Set();
  for (const category of categories) {
    if (!isCategory(category)) throw invalidResponse("Категория не соответствует схеме");
    if (seen.has(category.id)) throw invalidResponse(`Повторяющийся id категории: ${category.id}`);
    seen.add(category.id);
  }
  return categories;
}

export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("client.requestJson должен быть функцией");
  }

  async function getTasks(filters, { signal } = {}) {
    const normalized = normalizeFilters(filters);
    const payload = await client.requestJson("/tasks", { query: normalized, signal });
    return validateTaskCollection(payload);
  }

  async function getTaskById(id, { signal } = {}) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("id должен быть положительным безопасным целым");
    }
    const payload = await client.requestJson(`/tasks/${id}`, { signal });
    const task = payload?.data;
    if (!isTask(task)) throw invalidResponse("Задача не соответствует схеме");
    return task;
  }

  async function getCategories({ signal } = {}) {
    const payload = await client.requestJson("/categories", { signal });
    return validateCategoryCollection(payload);
  }

  async function loadInitialData(filters, { signal } = {}) {
    const normalized = normalizeFilters(filters);
    const [tasksResult, categories] = await Promise.all([
      client.requestJson("/tasks", { query: normalized, signal }).then(validateTaskCollection),
      client.requestJson("/categories", { signal }).then(validateCategoryCollection),
    ]);
    return { tasks: tasksResult.tasks, categories, meta: tasksResult.meta };
  }

  async function createTask(draft, { signal } = {}) {
    if (!draft || typeof draft !== "object") {
      throw new TypeError("draft должен быть объектом");
    }
    const payload = await client.requestJson("/tasks", { method: "POST", body: draft, signal });
    const task = payload?.data;
    if (!isTask(task)) throw invalidResponse("Созданная задача не соответствует схеме");
    return task;
  }

  async function updateTask(id, changes, { signal } = {}) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("id должен быть положительным безопасным целым");
    }
    if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
      throw new TypeError("changes должен быть объектом");
    }
    const payload = await client.requestJson(`/tasks/${id}`, {
      method: "PATCH",
      body: changes,
      signal,
    });
    const task = payload?.data;
    if (!isTask(task)) throw invalidResponse("Обновлённая задача не соответствует схеме");
    return task;
  }

  async function setTaskCompleted(id, completed, { signal } = {}) {
    if (typeof completed !== "boolean") {
      throw new TypeError("completed должен быть boolean");
    }
    return updateTask(id, { completed }, { signal });
  }

  async function deleteTask(id, { signal } = {}) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("id должен быть положительным безопасным целым");
    }
    const result = await client.requestJson(`/tasks/${id}`, { method: "DELETE", signal });
    if (result !== null) {
      throw invalidResponse("DELETE должен вернуть пустой ответ 204");
    }
    return null;
  }

  async function resetDemoData() {
    const payload = await client.requestJson("/debug/reset", { method: "POST" });
    if (!payload?.data?.reset) {
      throw invalidResponse("Ответ reset не подтверждает восстановление");
    }
    return payload.data;
  }

  return {
    getTasks,
    getTaskById,
    getCategories,
    loadInitialData,
    createTask,
    updateTask,
    setTaskCompleted,
    deleteTask,
    resetDemoData,
  };
}
