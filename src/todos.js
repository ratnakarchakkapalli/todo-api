// Business logic for todos
const todos = [
  { id: 1, title: 'Learn CI/CD', completed: false },
  { id: 2, title: 'Build a project', completed: false },
  { id: 3, title: 'Deploy to production', completed: false },
  { id: 4, title: 'Master Docker & Kubernetes', completed: false }
];

const getTodos = () => {
  return todos;
};

const getTodoById = (id) => {
  return todos.find(todo => todo.id === parseInt(id));
};

const addTodo = (title) => {
  if (!title || title.trim() === '') {
    throw new Error('Title cannot be empty');
  }
  const newTodo = {
    id: Math.max(...todos.map(t => t.id), 0) + 1,
    title: title.trim(),
    completed: false
  };
  todos.push(newTodo);
  return newTodo;
};

module.exports = {
  getTodos,
  getTodoById,
  addTodo
};
