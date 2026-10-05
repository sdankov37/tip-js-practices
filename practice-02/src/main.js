import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  createTask,
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";

//Вспомогательный вывод 

function printTasks(tasks) {
  for (const task of tasks) {
    console.log(
      `  #${task.id} ${task.title} | completed: ${task.completed} | priority: ${task.priority}`
    );
  }
}

function printStats(label, tasks) {
  // Деструктуризация сводки — одна из целей задания 3.
  const { total, completed, pending, progress } = getTaskStats(tasks);

  console.log(
    `[${label}] всего: ${total}; выполнено: ${completed}; осталось: ${pending}`
  );

  if (total === 0) {
    console.log(`[${label}] Задач пока нет`);
  } else {
    console.log(`[${label}] Прогресс: ${progress.toFixed(1)}%`);
  }
}

// Возвращает новый массив при успехе, null — при отказе.
// Состояние заменяется только при result.ok === true.
function applyResult(result, label) {
  if (result.ok) {
    console.log(`[успех] ${label}`);
    return result.tasks;
  }
  console.error(`[отказ] ${label}: ${result.error}`);
  return null;
}

//Общ

console.log("========== ОБЩИЙ СЦЕНАРИЙ ==========");

let currentTasks = demoTasks;

console.log("\nИсходные задачи:");
printTasks(currentTasks);
console.log("Названия:", getTaskTitles(currentTasks));
console.log(
  "Невыполненные id:",
  getPendingTasks(currentTasks).map((task) => task.id)
);
console.log(`Поиск id = 4: "${findTaskById(currentTasks, 4).title}"`);
console.log(`Поиск id = 777: ${findTaskById(currentTasks, 777)}`);
console.log(`Поиск строкового "4": ${findTaskById(currentTasks, "4")}`);

printStats("Исходный набор", currentTasks);

let next = applyResult(
  addTask(currentTasks, 20, "Добавить проверку", "high"),
  "добавление id = 20"
);
if (next !== null) currentTasks = next;
printStats("После добавления id = 20", currentTasks);

next = applyResult(
  setTaskCompleted(currentTasks, 4, true),
  "выполнение id = 4"
);
if (next !== null) currentTasks = next;
printStats("После выполнения id = 4", currentTasks);

next = applyResult(
  renameTask(currentTasks, 10, "Подготовить инструкцию запуска"),
  "переименование id = 10"
);
if (next !== null) currentTasks = next;
printStats("После переименования id = 10", currentTasks);

next = applyResult(removeTask(currentTasks, 7), "удаление id = 7");
if (next !== null) currentTasks = next;
printStats("После удаления id = 7", currentTasks);

console.log("\nИтоговые идентификаторы:", currentTasks.map((task) => task.id));

//Показ ошибка

console.log("\nПопытка повторного добавления id = 20:");
const duplicate = addTask(currentTasks, 20, "Дубликат", "low");
if (duplicate.ok) {
  currentTasks = duplicate.tasks;
} else {
  console.error(`Ошибка: ${duplicate.error}`);
}
console.log(
  "Состояние после отказа:",
  currentTasks.map((task) => task.id)
);

//Подтверждение неизменности demoTasks

console.log("\nИсходный demoTasks не изменён:");
printTasks(demoTasks);

//Вар 2

console.log(`\n========== ИНДИВИДУАЛЬНЫЙ ВАРИАНТ ${variantNumber} ==========`);

let variantState = variantTasks;

printStats("Исходный набор варианта", variantState);

next = applyResult(
  addTask(variantState, 80, "Провести демонстрацию доклада", "medium"),
  "добавление id = 80 (medium)"
);
if (next !== null) variantState = next;
printStats("После добавления id = 80", variantState);

next = applyResult(
  setTaskCompleted(variantState, 11, true),
  "выполнение id = 11 (уже выполнена)"
);
if (next !== null) variantState = next;
printStats("После выполнения id = 11", variantState);

next = applyResult(
  renameTask(variantState, 23, "Собрать и структурировать материал доклада"),
  "переименование id = 23"
);
if (next !== null) variantState = next;
printStats("После переименования id = 23", variantState);

next = applyResult(removeTask(variantState, 37), "удаление id = 37");
if (next !== null) variantState = next;
printStats("После удаления id = 37", variantState);

console.log("\nПопытка повторного добавления id = 80:");
const duplicateVariant = addTask(variantState, 80, "Дубликат", "low");
if (duplicateVariant.ok) {
  variantState = duplicateVariant.tasks;
} else {
  console.error(`Ошибка: ${duplicateVariant.error}`);
}
console.log(
  "Состояние после отказа:",
  variantState.map((task) => task.id)
);

console.log("\nИтоговые задачи варианта:");
printTasks(variantState);
printStats("Итоговая сводка варианта", variantState);

console.log("\nИсходный variantTasks не изменён:");
printTasks(variantTasks);