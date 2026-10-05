"use strict";

// ==== ДАННЫЕ ВАРИАНТА ====
const totalTasks = 12;
const completedTasks = 5;
const dailyLimit = 3;

// ==== ПРОВЕРКА ДОПУСТИМОСТИ ====
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

const limitIsValid =
  Number.isFinite(dailyLimit) &&
  Number.isInteger(dailyLimit) &&
  dailyLimit >= 1 &&
  dailyLimit <= 1000;

//Основа
if (!totalIsValid) {
  console.log("Ошибка: totalTasks должно быть целым числом от 0 до 1000");
} else if (!completedIsValid) {
  console.log("Ошибка: completedTasks должно быть целым числом от 0 до totalTasks");
} else if (!limitIsValid) {
  console.log("Ошибка: dailyLimit должно быть целым числом от 1 до 1000");
} else {
  let remaining = totalTasks - completedTasks;

  if (remaining === 0) {
    console.log("Все задачи уже выполнены");
    console.log("Потребуется дней: 0");
  } else {
    console.log(`Осталось задач: ${remaining}`);

    let day = 0;
    while (remaining > 0) {
      day += 1;
      const doneToday = Math.min(dailyLimit, remaining);
      remaining -= doneToday;
      console.log(`День ${day}: выполнено ${doneToday}, осталось ${remaining}`);
    }

    console.log(`Потребуется дней: ${day}`);
  }
}