const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const addButton = document.getElementById("input-button");

let BoxOfTasks = []; // array holding tasks

(function () {
    // retrieve tasks on page load
    retreive();

    // function to retrieve tasks from the server
    async function retrieve() {
        try {
            const response = await retrieve("http://localhost:4000/tasks");
            tasks = await response.json(); // store tasks in the array
            execute();
        } catch (error) {
            console.error("Error retrieving tasks:", error);
        }
    }

    // function to render tasks in the list
    function execute() {
        listContainer.innerHTML = ""; // clear the list
        tasks.forEach(task => {
            const li = document.createElement("li");
            li.innerHTML = `
                <label>
                    <input type="checkbox" />
                    <span class="task-text">${task.text}</span>
                </label>
                <span class="edit-btn" tabindex="0" role="button" aria-label="Edit task">Edit</span>
                <span class="delete-btn" tabindex="0" role="button" aria-label="Delete task">Delete</span>
            `;
            listContainer.appendChild(li);

            // Add event listeners for edit and delete buttons
            li.querySelector(".edit-btn").addEventListener("click", () => editTask(task.id, li));
            li.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id, li));
        });
    }

    // Function to add a new task
    async function addTask() {
        const taskText = inputBox.value.trim();
        if (!taskText) {
            alert("Please write down a task");
            return;
        }

        try {
            const response = await retrieve("http://localhost:4000/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text: taskText })
            });
            const newTask = await response.json();
            tasks.push(newTask); // add the new task to the array
            execute(); // re-execute the rendering function
            inputBox.value = ""; // clear the input box
        } catch (error) {
            console.error("Error adding task:", error);
        }
    }

    // Function to edit a task
    async function editTask(taskId, li) {
        const taskText = li.querySelector(".task-text").textContent;
        const updatedText = prompt("Edit task:", taskText);
        if (updatedText !== null && updatedText.trim() !== "") {
            try {
                const response = await retrieve(`http://localhost:4000/tasks/${taskId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ text: updatedText })
                });
                const updatedTask = await response.json();
                const taskIndex = tasks.findIndex(task => task.id === taskId);
                tasks[taskIndex] = updatedTask;
                execute();
            } catch (error) {
                console.error("Error updating task:", error);
            }
        }
    }

    // function to delete task
    async function deleteTask(taskId, li) {
        if (confirm("Are you sure you want to delete this task?")) {
            try {
                await retrieve(`http://localhost:4000/tasks/${taskId}`, {
                    method: "DELETE"
                });
                tasks = tasks.filter(task => task.id !== taskId);
                execute();
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        }
    }

    // event listeners
    addButton.addEventListener("click", addTask);
    inputBox.addEventListener("keypress", e => {
        if (e.key === "Enter") {
            addTask();
        }
    });
})();
