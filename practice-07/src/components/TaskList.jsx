import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks, categories, onToggle, onEdit, onDelete }) {
  return (
    <section aria-label="Список задач">
      <h2>Задачи</h2>
      {tasks.length === 0 ? (
        <p>По выбранным условиям задач нет.</p>
      ) : (
        <ul>
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              categoryName={categories.find(c => c.id === task.categoryId)?.name ?? 'Неизвестная категория'}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
