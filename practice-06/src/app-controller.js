import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (!api || !view) throw new TypeError("api и view обязательны");
  if (typeof api.loadInitialData !== "function" || typeof api.getTasks !== "function") {
    throw new TypeError("api должен содержать loadInitialData и getTasks");
  }
  if (typeof view.setListState !== "function" || typeof view.setTasks !== "function") {
    throw new TypeError("view должен содержать методы отображения");
  }

  let tasks = [];
  let categories = [];
  let filters = {};
  let editingId = null;
  let hasCategories = false;
  let activeController = null;
  let requestSeq = 0;
  let destroyed = false;

  function isStale(seq) { return destroyed || seq !== requestSeq; }
  function cancelActive() { activeController?.abort(); activeController = null; }

  async function load({ useInitial = !hasCategories } = {}) {
    cancelActive();
    const controller = new AbortController();
    activeController = controller;
    requestSeq += 1;
    const seq = requestSeq;

    view.setListState("loading");
    view.notify("", "");

    try {
      if (useInitial) {
        const result = await api.loadInitialData(filters, { signal: controller.signal });
        if (isStale(seq)) return;
        categories = result.categories;
        hasCategories = true;
        tasks = result.tasks;
        view.setCategories(categories);
        view.setTasks(tasks, categories);
        view.setTotal(tasks.length);
        view.setListState(tasks.length === 0 ? "empty" : "ready");
      } else {
        const result = await api.getTasks(filters, { signal: controller.signal });
        if (isStale(seq)) return;
        tasks = result.tasks;
        view.setTasks(tasks, categories);
        view.setTotal(tasks.length);
        view.setListState(tasks.length === 0 ? "empty" : "ready");
      }
    } catch (error) {
      if (isStale(seq)) return;
      if (error instanceof ApiError && error.kind === "aborted") return;
      view.setListState("error", messageForError(error));
    } finally {
      if (activeController === controller) activeController = null;
    }
  }

  async function reloadList() {
    try {
      const result = await api.getTasks(filters);
      tasks = result.tasks;
      view.setTasks(tasks, categories);
      view.setTotal(tasks.length);
      view.setListState(tasks.length === 0 ? "empty" : "ready");
    } catch (error) {
      if (error instanceof ApiError && error.kind === "aborted") return;
      view.setListState("error", messageForError(error));
    }
  }

  async function start(initialFilters = {}) {
    filters = { ...initialFilters };
    await load({ useInitial: !hasCategories });
  }

  async function applyFilters(nextFilters) {
    filters = { ...nextFilters };
    await load({ useInitial: !hasCategories });
  }

  async function refresh() {
    await load({ useInitial: !hasCategories });
  }

  async function submit(draft) {
    const result = validateDraft(draft, categories);
    if (!result.valid) {
      view.showFormErrors(result.errors);
      return;
    }
    view.showFormErrors({});

    view.setMutationPending(true);
    try {
      if (editingId !== null) {
        await api.updateTask(editingId, result.value);
        editingId = null;
      } else {
        await api.createTask(result.value);
      }
      view.setFormTask(null);
      view.notify("Задача сохранена.", "success");
      await reloadList();
    } catch (error) {
      if (error instanceof ApiError && error.kind === "aborted") return;
      view.notify(messageForError(error), "error");
    } finally {
      view.setMutationPending(false);
    }
  }

  async function toggleTask(id) {
    const found = tasks.find((task) => task.id === id);
    if (!found) return;
    view.setMutationPending(true);
    try {
      await api.setTaskCompleted(id, !found.completed);
      view.notify("Статус обновлён.", "success");
      await reloadList();
    } catch (error) {
      if (error instanceof ApiError && error.kind === "aborted") return;
      view.notify(messageForError(error), "error");
    } finally {
      view.setMutationPending(false);
    }
  }

  async function deleteTask(id) {
    view.setMutationPending(true);
    try {
      await api.deleteTask(id);
      if (editingId === id) {
        editingId = null;
        view.setFormTask(null);
      }
      view.notify("Задача удалена.", "success");
      await reloadList();
    } catch (error) {
      if (error instanceof ApiError && error.kind === "aborted") return;
      view.notify(messageForError(error), "error");
    } finally {
      view.setMutationPending(false);
    }
  }

  async function resetData() {
    view.setMutationPending(true);
    try {
      await api.resetDemoData();
      view.notify("Исходные данные восстановлены.", "success");
      await reloadList();
    } catch (error) {
      if (error instanceof ApiError && error.kind === "aborted") return;
      view.notify(messageForError(error), "error");
    } finally {
      view.setMutationPending(false);
    }
  }

  function beginEdit(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    editingId = id;
    view.setFormTask(task);
  }

  function cancelEdit() {
    editingId = null;
    view.setFormTask(null);
    view.showFormErrors({});
  }

  function destroy() {
    destroyed = true;
    cancelActive();
  }

  return {
    start,
    applyFilters,
    refresh,
    submit,
    beginEdit,
    cancelEdit,
    toggleTask,
    deleteTask,
    resetData,
    destroy,
  };
}