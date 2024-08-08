import React, { useState, useEffect } from 'react';
import './App.css';

// Helper function to load todos from localStorage
const loadTodosFromLocalStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('todos')) || [];
  } catch (error) {
    console.error('Failed to load todos from local storage', error);
    return [];
  }
};

// Helper function to save todos to localStorage
const saveTodosToLocalStorage = (todos) => {
  try {
    localStorage.setItem('todos', JSON.stringify(todos));
  } catch (error) {
    console.error('Failed to save todos to local storage', error);
  }
};

// TodoItem component for rendering individual todo items
const TodoItem = ({
  todo, onEdit, onDelete, onToggleComplete, isEditing,
  onUpdate, onCancel, editingText, onTextChange
}) => (
  <li key={todo.id} className={`todo stack-small ${todo.completed ? 'completed' : ''}`}>
    {isEditing === todo.id ? (
      <form onSubmit={(e) => onUpdate(e, todo.id)}>
        <div className="c-cb">
          <input
            type="text"
            className="todo-text"
            value={editingText}
            onChange={(e) => onTextChange(e.target.value)}
          />
        </div>
        <div className="btn-group">
          <button type="submit" className="btn">
            Save <span className="visually-hidden">{todo.text}</span>
          </button>
          <button type="button" className="btn btn__danger" onClick={onCancel}>
            Cancel <span className="visually-hidden">{todo.text}</span>
          </button>
        </div>
      </form>
    ) : (
      <>
        <div className="c-cb">
          <input
            id={`todo-${todo.id}`}
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggleComplete(todo.id)}
          />
          <label className="todo-label" htmlFor={`todo-${todo.id}`}>
            {todo.text} <span className="date-created">({todo.dateCreated})</span> <span className="time-created">at {todo.time}</span>
          </label>
        </div>
        <div className="btn-group">
          <button type="button" className="btn" onClick={() => onEdit(todo.id)}>
            Edit <span className="visually-hidden">{todo.text}</span>
          </button>
          <button type="button" className="btn btn__danger" onClick={() => onDelete(todo.id)}>
            Delete <span className="visually-hidden">{todo.text}</span>
          </button>
        </div>
      </>
    )}
  </li>
);

// FilterButtons component for managing filters
const FilterButtons = ({ filter, onFilterChange }) => (
  <div className="filters btn-group stack-exception">
    {['all', 'active', 'completed'].map((f) => (
      <button
        key={f}
        type="button"
        className={`btn toggle-btn ${filter === f ? 'active' : ''}`}
        onClick={() => onFilterChange(f)}
      >
        <span className="visually-hidden">Show </span>
        <span>{f.charAt(0).toUpperCase() + f.slice(1)}</span>
        <span className="visually-hidden"> tasks</span>
      </button>
    ))}
  </div>
);

function App() {
  const [todos, setTodos] = useState(loadTodosFromLocalStorage()); // State for todos
  const [newTodo, setNewTodo] = useState(''); // State for new todo input
  const [newDateTime, setNewDateTime] = useState(''); // State for new todo date-time input
  const [isEditing, setIsEditing] = useState(null); // State to track the editing todo
  const [editingText, setEditingText] = useState(''); // State for the editing text
  const [filter, setFilter] = useState('all'); // State for the current filter

  useEffect(() => {
    saveTodosToLocalStorage(todos);
  }, [todos]);

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim() === '' || newDateTime.trim() === '') return;
    const newTodoItem = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      dateCreated: new Date(newDateTime).toLocaleDateString(),
      time: new Date(newDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Time in hours and minutes
    };
    setTodos([...todos, newTodoItem]);
    setNewTodo('');
    setNewDateTime('');
  };

  const handleEditTodo = (id) => {
    const todoToEdit = todos.find((todo) => todo.id === id);
    setIsEditing(id);
    setEditingText(todoToEdit.text);
  };

  const handleUpdateTodo = (e, id) => {
    e.preventDefault();
    if (editingText.trim() === '') return; // Prevent updating with empty text
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, text: editingText } : todo
    );
    setTodos(updatedTodos);
    setIsEditing(null);
    setEditingText('');
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleToggleComplete = (id) => {
    setTodos(todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteAll = () => {
    if (window.confirm("Are you sure you want to delete all tasks?")) {
      setTodos([]);
    }
  };

  const handleMarkAllCompleted = () => {
    setTodos(todos.map((todo) => ({ ...todo, completed: true })));
  };

  const handleMarkAllUncompleted = () => {
    setTodos(todos.map((todo) => ({ ...todo, completed: false })));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return false;
  });

  return (
    <div className="todoapp stack-large">
      <h1>To-Do App</h1>
      <form onSubmit={handleAddTodo}>
        <h2 className="label-wrapper">
          <label htmlFor="new-todo-input" className="label__lg">
            Create a Task
          </label>
        </h2>
        <input
          type="text"
          id="new-todo-input"
          className="input input__lg"
          autoComplete="off"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <input
          type="datetime-local"
          id="new-todo-datetime"
          className="input input__lg"
          value={newDateTime}
          onChange={(e) => setNewDateTime(e.target.value)}
        />
        <button type="submit" className="btn btn__primary btn__lg">
          Add
        </button>
      </form>
      <FilterButtons filter={filter} onFilterChange={setFilter} />
      <h2 id="list-heading">{filteredTodos.length} task(s) remaining</h2>
      <ul role="list" className="todo-list stack-large stack-exception" aria-labelledby="list-heading">
        {filteredTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onEdit={handleEditTodo}
            onDelete={handleDeleteTodo}
            onToggleComplete={handleToggleComplete}
            isEditing={isEditing}
            onUpdate={handleUpdateTodo}
            onCancel={() => setIsEditing(null)}
            editingText={editingText}
            onTextChange={setEditingText}
          />
        ))}
      </ul>
      <div className="btn-group">
        <button type="button" className="btn btn__danger" onClick={handleDeleteAll}>
          Delete All
        </button>
        <button type="button" className="btn" onClick={handleMarkAllCompleted}>
          Mark All Done
        </button>
        <button type="button" className="btn" onClick={handleMarkAllUncompleted}>
          Mark All Undone
        </button>
      </div>
    </div>
  );
}

export default App;
