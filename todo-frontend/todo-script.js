let tasks = [];
(async function() {
    const inputBox = document.getElementById("input-box");
    const listContainer = document.getElementById("list-container");
    const addButton = document.getElementById("input-button");

    const completedCounter = document.getElementById("completed-count");
    const uncompletedCounter = document.getElementById("uncompleted-count");
    const totalCounter = document.getElementById("total-count"); // total-count missing in HTML but keeping in case
    // helper to get token from localStorage
    function getAuthToken() {
        return localStorage.getItem("token");
    }
    // function to check if user is authenticated/token exists
    function isUserLoggedIn() {
        const token = getAuthToken();
        if (!token) {
            alert("User is not logged in. Please log in first.");
            window.location.href = "login.html"; // redirect to login if not logged in
            return false;
        }
        return true;
    }
    // function to build headers with Authorization for retrieve
    function getAuthHeaders(contentType = "application/json") {
        const token = getAuthToken();
        return {
            "Content-Type": contentType,
            "Authorization": `Bearer ${token}`
        };
    }
    // update counters for tasks
    function updateCounters() {
        const completedTasks = document.querySelectorAll("#list-container li.completed").length;
        const uncompletedTasks = document.querySelectorAll("#list-container li:not(.completed)").length;
        const totalTasks = completedTasks + uncompletedTasks;

        completedCounter.textContent = completedTasks;
        uncompletedCounter.textContent = uncompletedTasks;
        if (totalCounter) {
            totalCounter.textContent = totalTasks;
        }
    }
    // loading tasks from backend and give
    async function retrieveTasks() {
        if (!isUserLoggedIn()) return;
        try {
            const response = await fetch("http://localhost:4000/tasks", {
                headers: getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error("Failed to load tasks. Status " + response.status);
            }
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error("Error retrieving tasks:", error);
            alert("Failed to retrieve tasks: " + error.message);
        }
    }
    // give tasks list from array of task objects
    function renderTasks(tasks) {
        listContainer.innerHTML = ""; // clear current list

        tasks.forEach(task => {
            const li = document.createElement("li");
            li.setAttribute('role', 'listitem');
            li.innerHTML = `
                <label>
                    <input type="checkbox" ${task.completed ? "checked" : ""}>
                    <span class="task-text">${task.text}</span>
                </label>
                <span class="edit-btn" tabindex="0" role="button" aria-label="Edit task">Edit</span>
                <span class="delete-btn" tabindex="0" role="button" aria-label="Delete task">Delete</span>
            `;
            if (task.completed) {
                li.classList.add("completed");
            }
            // attach event listeners
            const checkbox = li.querySelector("input[type='checkbox']");
            const editBtn = li.querySelector(".edit-btn");
            const deleteBtn = li.querySelector(".delete-btn");
            const taskSpan = li.querySelector(".task-text");

            checkbox.addEventListener("change", () => updateTaskStatus(task.id, checkbox.checked, li));
            editBtn.addEventListener("click", () => editTask(task.id, taskSpan));
            editBtn.addEventListener("keypress", e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    editTask(task.id, taskSpan);
                }
            });
            deleteBtn.addEventListener("click", () => deleteTask(task.id));
            deleteBtn.addEventListener("keypress", e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    deleteTask(task.id);
                }
            });
            listContainer.appendChild(li);
        });
        updateCounters();
    }
    // add new task
    async function addTask() {
        if (!isUserLoggedIn()) return;

        const taskText = inputBox.value.trim();
        if (!taskText) {
            alert("Please write down a task");
            return;
        }
        try {
            const response = await fetch("http://localhost:4000/tasks", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ text: taskText })
            });
            if (!response.ok) {
                throw new Error("Failed to add task. Status " + response.status);
            }
            const newTask = await response.json();
            inputBox.value = "";
            retrieveTasks();
        } catch (error) {
            console.error("Error adding task:", error);
            alert("Error adding task: " + error.message);
        }
    }
    // update task text
    async function editTask(taskId, taskSpan) {
        if (!isUserLoggedIn()) return;

        const updatedText = prompt("Edit task:", taskSpan.textContent);
        if (updatedText === null || updatedText.trim() === "") {
            return;
        }
        try {
            const response = await fetch(`http://localhost:4000/tasks/${taskId}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({ text: updatedText.trim() })
            });
            if (!response.ok) {
                throw new Error("Failed to update task. Status " + response.status);
            }
            const updatedTask = await response.json();
            taskSpan.textContent = updatedTask.text;
            retrieveTasks();
        } catch (error) {
            console.error("Error updating task:", error);
            alert("Error updating task: " + error.message);
        }
    }
    // delete task
    async function deleteTask(taskId) {
        if (!isUserLoggedIn()) return;

        if (!confirm("Are you sure you want to delete this task?")) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:4000/tasks/${taskId}`, {
                method: "DELETE",
                headers: getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error("Failed to delete task. Status " + response.status);
            }
            retrieveTasks();
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("Error deleting task: " + error.message);
        }
    }
    // mark task completed/uncompleted
    async function updateTaskStatus(taskId, completed, liElement) {
        if (!isUserLoggedIn()) return;
        if (completed) {
            liElement.classList.add("completed");
        } else {
            liElement.classList.remove("completed");
        }
        updateCounters();
    }
    // logout button
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "login.html";
        });
    }
    // load tasks on page load
    retrieveTasks();

    addButton.addEventListener("click", addTask);

    inputBox.addEventListener("keypress", e => {
        if (e.key === "Enter") {
            addTask();
        }
    });

})();