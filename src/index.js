const express = require('express');
const { getTodos, getTodoById, addTodo } = require('./todos');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Todo API is running' });
});

// Get all todos
app.get('/todos', (req, res) => {
  res.status(200).json({
    success: true,
    data: getTodos(),
    message: 'Todos retrieved successfully'
  });
});

// Get todo by ID
app.get('/todos/:id', (req, res) => {
  const todo = getTodoById(req.params.id);
  if (!todo) {
    return res.status(404).json({
      success: false,
      message: 'Todo not found'
    });
  }
  res.status(200).json({
    success: true,
    data: todo
  });
});

// Add a new todo
app.post('/todos', (req, res) => {
  try {
    const { title } = req.body;
    const newTodo = addTodo(title);
    res.status(201).json({
      success: true,
      data: newTodo,
      message: 'Todo added successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Error handling
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Todo API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
