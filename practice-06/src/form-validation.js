const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

export function validateTaskDraft(draft, categories) {
  const errors = {};
  let title;
  let priority;
  let categoryId;

  if (typeof draft?.title !== "string") {
    errors.title = "Название должно быть строкой";
  } else {
    const trimmed = draft.title.trim();
    if (trimmed.length < 1) errors.title = "Название не должно быть пустым";
    else if (trimmed.length > 100) errors.title = "Не более 100 символов";
    else title = trimmed;
  }

  if (typeof draft?.priority !== "string" || !ALLOWED_PRIORITIES.has(draft.priority)) {
    errors.priority = "Выберите приоритет";
  } else {
    priority = draft.priority;
  }

  const rawCategory = draft?.categoryId;
  const numericCategory =
    typeof rawCategory === "string" && rawCategory.trim() !== ""
      ? Number(rawCategory)
      : rawCategory;

  if (!Number.isSafeInteger(numericCategory) || numericCategory <= 0) {
    errors.categoryId = "Выберите категорию";
  } else if (!Array.isArray(categories) || !categories.some((c) => c.id === numericCategory)) {
    errors.categoryId = "Категория не найдена";
  } else {
    categoryId = numericCategory;
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, value: null, errors };
  }
  return { valid: true, value: { title, priority, categoryId }, errors: {} };
}
