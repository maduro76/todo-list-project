const express = require("express");
const path = require("path");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
// serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "../todo-list-project/todo-frontend")));
function authenticateToken(request, response, next) {
    const authHeader = request.headers["authorization"];
    console.log("Authorization header:", authHeader); // Debug log
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) return response.sendStatus(401);
    jwt.verify(token, "tom-tom-tom-tom-tom-random-tom-tomek-dom-dom-dom-!@#$%^&*()", (error, user) => {
        if (error) return response.sendStatus(403);
        request.user = user;
        next();
    });
}
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "todoapp",
  password: "123",
  port: 5432,
});

// get user by id
app.get("/users/:id", async (request, response) => {
    const { id } = request.params;
    try {
        const result = await pool.query("SELECT id, username FROM users WHERE id = $1", [id]);
        response.json(result.rows[0]);
    } catch (error) {
        response.status(500).json({ error: "Failed to retrieve user." });
    }
});
// user registration 
app.post("/register", async (request, response) => {
    const {username, email, password} = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try{
        const result = await pool.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username", [username, email, hashedPassword]);
        response.status(201).json(result.rows[0]);
    } catch (error) {
        response.status(500).json({ error: "Failed to register user." });
    }
});
// user login
app.post("/login", async (request, response) => {
    const {username, password} = request.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = result.rows[0];
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id }, "tom-tom-tom-tom-tom-random-tom-tomek-dom-dom-dom-!@#$%^&*()");
            response.json ({ token });
        } else {
            response.status(401).json({ error: "Invalid username or password." });
        }
    } catch (error) {
        response.status(500).json({ error: "Failed to login user." });
    }
});
app.get("/login", (request, response) => {
    response.sendFile(path.join(__dirname, "../todo-frontend/login.html"));
});
app.get("/register", (request, response) => {
    response.sendFile(path.join(__dirname, "../todo-frontend/login.html"));
});

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "../todo-frontend/index.html"));
});

// get all tasks
app.get("/tasks", authenticateToken, async (request, response) => {
    const userId = request.user.id;
    try {
        const result = await pool.query("SELECT id, text FROM tasks WHERE user_id = $1 ORDER BY id ASC", [userId]);
        response.json(result.rows);
    } catch (error) {
        response.status(500).json({ error: "Failed to retrieve tasks." });
    }
});

// create a new task when the user clicks on the add button
app.post("/tasks", authenticateToken, async (request, response) => {
    const { text } = request.body;
    const userId = request.user.id;
    if (!text) return response.status(400).json({ error: "Task name is required" });
    try {
        const result = await pool.query("INSERT INTO tasks (text, user_id) VALUES ($1, $2) RETURNING id, text", [text, userId]);
        response.status(201).json(result.rows[0]);
    } catch (error) {
        response.status(500).json({ error: "Failed to create task." });
    }
});

// update task by id when user clicks on the edit button
app.put("/tasks/:id", authenticateToken, async (request, response) => {
    const { id } = request.params;
    const { text } = request.body;
    const userId = request.user.id;
    if (!text) return response.status(400).json({ error: "Task name is required" });
    try {
        // Ensure the task belongs to the authenticated user
        const result = await pool.query(
            "UPDATE tasks SET text = $1 WHERE id = $2 AND user_id = $3 RETURNING id, text",
            [text, id, userId]
        );
        if (result.rowCount === 0) {
            return response.status(404).json({ error: "Task not found or not authorized." });
        }
        response.json(result.rows[0]);
    } catch (error) {
        response.status(500).json({ error: "Failed to update task." });
    }
});

// delete task by id when user clicks on the delete button
app.delete("/tasks/:id", authenticateToken, async (request, response) => {
    const { id } = request.params;
    const userId = request.user.id;
    try {
        // Ensure the task belongs to the authenticated user
        const result = await pool.query(
            "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id",
            [id, userId]
        );
        if (result.rowCount === 0) {
            return response.status(404).json({ error: "Task not found or not authorized." });
        }
        response.json({ message: "Task deleted successfully", id: result.rows[0].id });
    } catch (error) {
        response.status(500).json({ error: "Failed to delete task." });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));