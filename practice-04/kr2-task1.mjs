import { validateTaskDraft } from "./src/form-validation.js";

const good = { id: "20", title: " Изучить localStorage ", priority: "high" };
const bad  = { id: "20", title: " ", priority: "high" };

console.log("Проверка 1 (корректная):");
console.log(JSON.stringify(validateTaskDraft(good, []), null, 2));

console.log("\nПроверка 2 (только пробелы):");
console.log(JSON.stringify(validateTaskDraft(bad, []), null, 2));