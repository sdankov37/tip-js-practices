"use strict";

const totalTasks = 6;
const completedTasks = 0;
const dailyLimit = 1;

const totalIsValid =
  Number.isFinite(totalTasks) && Number.isInteger(totalTasks) &&
  totalTasks >= 0 && totalTasks <= 1000;

const completedIsValid =
  Number.isFinite(completedTasks) && Number.isInteger(completedTasks) &&
  completedTasks >= 0 && completedTasks <= totalTasks;

const limitIsValid =
  Number.isFinite(dailyLimit) && Number.isInteger(dailyLimit) &&
  dailyLimit >= 1 && dailyLimit <= 1000;

if (!totalIsValid) {
  console.log("Ошибка: totalTasks должно быть целым числом от 0 до 1000");
} else if (!completedIsValid) {
  console.log("Ошибка: completedTasks должно быть целым числом от 0 до totalTasks");
} else if (!limitIsValid) {
  console.log("Ошибка: dailyLimit должно быть целым числом от 1 до 1000");
} else {
  let remaining = totalTasks - completedTasks;
  let calendarDay = 0;
  let workingDays = 0;

  if (remaining === 0) {
    console.log("Все задачи уже выполнены");
    console.log("Рабочих дней: 0");
    console.log("Календарных дней: 0");
  } else {
    while (remaining > 0) {
      calendarDay += 1;
      const weekday = ((calendarDay - 1) % 7) + 1; // 1=Пн ... 7=Вс
      const isWeekend = weekday === 6 || weekday === 7;

      if (isWeekend) {
        console.log(`День ${calendarDay} (выходной): осталось ${remaining}`);
      } else {
        const doneToday = Math.min(dailyLimit, remaining);
        remaining -= doneToday;
        workingDays += 1;
        console.log(`День ${calendarDay} (рабочий): выполнено ${doneToday}, осталось ${remaining}`);
      }
    }

    console.log(`Рабочих дней: ${workingDays}`);
    console.log(`Календарных дней: ${calendarDay}`);
  }
}