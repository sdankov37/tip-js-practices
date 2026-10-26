function renderApp() {
  const visibleTasks = getVisibleTasks(currentTasks, currentFilter);

  renderTaskList(elements.list, visibleTasks);
  renderSummary(elements.summary, currentTasks, visibleTasks.length);
  renderEmptyState(elements.empty, currentTasks.length, visibleTasks.length);

  for (const button of elements.filters.querySelectorAll("button[data-filter]")) {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  }
}

function setFormMode(id = null) {
  if (id === null) {
    editingId = null;
    elements.form.reset();
    clearFormErrors();
    elements.idInput.disabled = false;
    elements.formHeading.textContent = "Добавление задачи";
    elements.formMode.textContent = "Режим создания новой задачи.";
    elements.submitButton.textContent = "Добавить задачу";
    elements.cancelButton.hidden = true;
    elements.idInput.focus();
    return;
  }

  const found = findTaskById(currentTasks, id);
  if (found === undefined) {
    elements.formMessage.textContent = `Задача с id = ${id} не найдена`;
    return;
  }

  editingId = found.id;
  clearFormErrors();
  elements.idInput.value = String(found.id);
  elements.idInput.disabled = true;
  elements.titleInput.value = found.title;
  elements.priorityInput.value = found.priority;
  elements.formHeading.textContent = "Редактирование задачи";
  elements.formMode.textContent = `Редактируется задача с id = ${found.id}.`;
  elements.submitButton.textContent = "Сохранить изменения";
  elements.cancelButton.hidden = false;
  elements.titleInput.focus();
}

function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(elements.form);
  const draft = {
    id: formData.get("id"),
    title: formData.get("title"),
    priority: formData.get("priority"),
  };

  const validation = validateTaskDraft(draft, currentTasks, editingId);
  if (!validation.ok) {
    showFormErrors(validation.errors);
    return;
  }

  clearFormErrors();
  const { id, title, priority } = validation.value;
  const wasEditing = editingId !== null;

  const result = wasEditing
    ? updateTask(currentTasks, id, title, priority)
    : addTask(currentTasks, id, title, priority);

  if (!result.ok) {
    elements.formMessage.textContent = result.error;
    return;
  }

  currentTasks = result.tasks;
  setFormMode(null);
  persistCurrentTasks(wasEditing ? "Изменения сохранены." : "Задача добавлена.");
}

function handleTaskListClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-action]");
  if (!button || !elements.list.contains(button)) return;

  const action = button.dataset.action;
  if (action !== "toggle" && action !== "delete" && action !== "edit") return;

  const card = button.closest("li[data-task-id]");
  if (!card) return;

  const id = Number(card.dataset.taskId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    elements.message.textContent = "Некорректный идентификатор задачи.";
    return;
  }

  if (action === "edit") {
    setFormMode(id);
    return;
  }

  const found = findTaskById(currentTasks, id);
  if (found === undefined) {
    elements.message.textContent = `Задача с id = ${id} не найдена.`;
    return;
  }

  const result = action === "toggle"
    ? setTaskCompleted(currentTasks, id, found.completed === false)
    : removeTask(currentTasks, id);

  if (!result.ok) {
    elements.message.textContent = result.error;
    return;
  }

  currentTasks = result.tasks;
  elements.message.textContent = "";
  if (editingId === id) setFormMode(null);

  persistCurrentTasks(action === "toggle" ? "Статус обновлён." : "Задача удалена.");
  restoreTaskFocus(id, action);
}

function handleFilterClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-filter]");
  if (!button || !elements.filters.contains(button)) return;

  const filter = button.dataset.filter;
  if (!["all", "pending", "completed"].includes(filter)) return;

  currentFilter = filter;
  elements.message.textContent = "";
  renderApp();
}

function handleResetClick() {
  const result = removeSavedTasks(window.localStorage, storageKey);
  if (!result.ok) {
    elements.storageStatus.classList.add("is-warning");
    elements.storageStatus.textContent = result.error;
    return;
  }

  currentTasks = initialTasks.map((task) => ({ ...task }));
  currentFilter = "all";
  setFormMode(null);
  elements.message.textContent = "";
  elements.storageStatus.classList.remove("is-warning");
  elements.storageStatus.textContent = "Сохранённые данные удалены. Используется исходный набор.";
  renderApp();
}