import { useState } from 'react';
import { tasks as initialTasks, categories } from './data.js';
import { createInitialFilters } from './variant.js';
import {
  addTask,
  getTaskStats,
  removeTask,
  selectTasks,
  toggleTask,
  updateTask,
  validateTaskDraft,
} from './domain/task-service.js';
import TaskForm from './components/TaskForm.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskList from './components/TaskList.jsx';
import TaskStats from './components/TaskStats.jsx';

export default function App() {
  const [tasks, setTasks] = useState(() => initialTasks.map(task => ({ ...task })));
  const [filters, setFilters] = useState(createInitialFilters);
  const [editingId, setEditingId] = useState(null);

  const visibleTasks = selectTasks(tasks, filters);
  const stats = getTaskStats(tasks);
  const editingTask = editingId !== null ? (tasks.find(t => t.id === editingId) ?? null) : null;

  function nextId() {
    return tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
  }

  function handleSave(value) {
    const validation = validateTaskDraft(value, categories);
    if (!validation.valid) return false;
    if (editingId !== null) {
      setTasks(current => updateTask(current, editingId, validation.value));
      setEditingId(null);
    } else {
      setTasks(current => addTask(current, validation.value, nextId()));
    }
    return true;
  }

  function handleToggle(task) {
    setTasks(current => toggleTask(current, task.id));
  }

  function handleEdit(task) {
    setEditingId(task.id);
  }

  function handleDelete(task) {
    if (!window.confirm(`Удалить «${task.title}»?`)) return;
    setTasks(current => removeTask(current, task.id));
    if (editingId === task.id) setEditingId(null);
  }

  function handleCancel() {
    setEditingId(null);
  }

  return (
    <main>
      <h1>Задачи на React</h1>
      <p>ПР7: данные в памяти. Обновление страницы восстанавливает исходный набор.</p>
      <TaskStats stats={stats} />
      <TaskFilters filters={filters} categories={categories} onChange={setFilters} />
      <TaskForm
        key={editingId ?? 'new'}
        categories={categories}
        initialTask={editingTask}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      <TaskList
        tasks={visibleTasks}
        categories={categories}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </main>
  );
}
