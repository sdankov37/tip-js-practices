const priorities = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };

export default function TaskItem({ task, categoryName, onToggle, onEdit, onDelete }) {
  return (
    <li>
      <strong>{task.title}</strong>
      <p>
        {task.completed ? 'Выполнена' : 'В работе'}
        {' · '}{priorities[task.priority]}
        {' · '}{categoryName}
      </p>
      <div className="actions">
        <button type="button" onClick={() => onToggle(task)}>
          {task.completed ? 'Вернуть в работу' : 'Отметить выполненной'}
        </button>
        <button type="button" onClick={() => onEdit(task)}>Изменить</button>
        <button type="button" onClick={() => onDelete(task)}>Удалить</button>
      </div>
    </li>
  );
}
