"use strict";

//Вар
const totalTasks = 5;
const completedTasks = 6;

//Проверка
const totalIsValid =
  Number.isFinite(totalTasks) &&
  Number.isInteger(totalTasks) &&
  totalTasks >= 0 &&
  totalTasks <= 1000;

const completedIsValid =
  Number.isFinite(completedTasks) &&
  Number.isInteger(completedTasks) &&
  completedTasks >= 0 &&
  completedTasks <= totalTasks;

//Основа
if (!totalIsValid) {
  console.log("Ошибка: totalTasks должно быть целым числом от 0 до 1000");
} else if (!completedIsValid) {
  console.log("Ошибка: completedTasks должно быть целым числом от 0 до totalTasks");
} else if (totalTasks === 0) {
  console.log("Задач пока нет");
} else {
  const remainingTasks = totalTasks - completedTasks;
  const percent = completedTasks / totalTasks * 100;

  let status;
  if (completedTasks === 0) {
    status = "Не начато";
  } else if (completedTasks === totalTasks) {
    status = "Завершено";
  } else {
    status = "В работе";
  }

  console.log(`Всего задач: ${totalTasks}`);
  console.log(`Выполнено: ${completedTasks}`);
  console.log(`Осталось: ${remainingTasks}`);
  console.log(`Прогресс: ${percent.toFixed(1)}%`);
  console.log(`Статус: ${status}`);
}