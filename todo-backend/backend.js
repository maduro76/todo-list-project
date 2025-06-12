const express = require("express");
const path = require("path");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();

app.use(cors());
app.use(express.json());

// serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "../todo-list-project/todo-frontend")));

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "todoapp",
  password: "123",
  port: 5432,
});

app.get("/", (request, response) => {
    response.send("Welcome!");
});

// get all tasks
app.get("/tasks", async (request, response) => {
    try {
        const result = await pool.query("SELECT id, text FROM tasks ORDER BY id ASC");
        response.json(result.rows);
    } catch (error) {
        response.status(500).json({ error: "Failed to fetch tasks." });
    }
});

// create a new task when the user clicks on the add button
app.post("/tasks", async (request, response) => {
    const { text } = request.body;
    if (!text) return response.status(400).json({ error: "Task name is required" });
    try {
        const result = await pool.query("INSERT INTO tasks (text) VALUES ($1) RETURNING id, text", [text]);
        response.status(201).json(result.rows[0]);
    } catch (error) {
        response.status(500).json({ error: "Failed to create task." });
    }
});

// update task by id when user clicks on the edit button
app.put("/tasks/:id", async (request, response) => {
    const { id } = request.params;
    const { text } = request.body;
    if (!text) return response.status(400).json({ error: "Task name is required" });
    try {
        const result = await pool.query("UPDATE tasks SET text = $1 WHERE id = $2 RETURNING id, text", [text, id]);
        if (result.rowCount === 0) {
            return response.status(404).json({ error: "Task not found." });
        }
        response.json(result.rows[0]);
    } catch (error) {
        response.status(500).json({ error: "Failed to update task." });
    }
});

// delete task by id when user clicks on the delete button
app.delete("/tasks/:id", async (request, response) => {
    const { id } = request.params;
    try {
        const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING id", [id]);
        if (result.rowCount === 0) {
            return response.status(404).json({ error: "Task not found." });
        }
        response.json({ message: "Task deleted successfully", id: result.rows[0].id });
    } catch (error) {
        response.status(500).json({ error: "Failed to delete task." });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
