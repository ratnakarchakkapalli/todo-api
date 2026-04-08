const request = require('supertest');
const app = require('../src/index');
const { getTodos, addTodo } = require('../src/todos');

describe('Todo API', () => {
  
  describe('GET /health', () => {
    it('should return health status OK', async () => {
      const response = await request(app)
        .get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });

  describe('GET /todos', () => {
    it('should return all todos', async () => {
      const response = await request(app)
        .get('/todos');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return todos with correct structure', async () => {
      const response = await request(app)
        .get('/todos');
      
      const todo = response.body.data[0];
      expect(todo).toHaveProperty('id');
      expect(todo).toHaveProperty('title');
      expect(todo).toHaveProperty('completed');
    });
  });

  describe('GET /todos/:id', () => {
    it('should return a specific todo', async () => {
      const response = await request(app)
        .get('/todos/1');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .get('/todos/999');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /todos', () => {
    it('should add a new todo', async () => {
      const response = await request(app)
        .post('/todos')
        .send({ title: 'Test Todo' });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Todo');
    });

    it('should reject empty title', async () => {
      const response = await request(app)
        .post('/todos')
        .send({ title: '' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Todos module', () => {
    it('should throw error for empty title', () => {
      expect(() => addTodo('')).toThrow('Title cannot be empty');
    });

    it('should throw error for null title', () => {
      expect(() => addTodo(null)).toThrow('Title cannot be empty');
    });
  });
});
