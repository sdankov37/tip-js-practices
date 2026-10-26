const PRIORITY_LABELS = Object.freeze({
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
});

export function createTaskElement(task, category) {
  const li = document.createElement("li");
  li.className = "task-card";
  li.dataset.taskId = String(task.id);
  if (task.completed === true) li.classList.add("is-completed");

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;
  li.append(title);

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed === true ? "Выполнена" : "В работе";
  meta.append(status);

  const priority = document.createElement("span");
  priority.className = "task-priority";
  priority.textContent = PRIORITY_LABELS[task.priority] ?? task.priority;
  meta.append(priority);

  const categoryEl = document.createElement("span");
  categoryEl.className = "task-category";
  categoryEl.textContent = category?.name ?? "Без категории";
  meta.append(categoryEl);

  li.append(meta);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  for (const [action, label] of [
    ["toggle", "Выполнена"],
    ["edit", "Изменить"],
    ["delete", "Удалить"],
  ]) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = action;
    if (action === "toggle") {
      button.setAttribute("aria-pressed", task.completed === true ? "true" : "false");
    }
    const span = document.createElement("span");
    span.className = "action-label";
    span.textContent = label;
    button.append(span);
    actions.append(button);
  }

  li.append(actions);
  return li;
}

export function renderTaskList(list, tasks, categories) {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const nodes = tasks.map((task) => createTaskElement(task, byId.get(task.categoryId)));
  list.replaceChildren(...nodes);
}
