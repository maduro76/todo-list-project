(function() {
    const inputBox = document.getElementById("input-box");
    const listContainer = document.getElementById("list-container");
    const addButton = document.getElementById("input-button");

    const completedCounter = document.getElementById("completed-count");
    const uncompletedCounter = document.getElementById("uncompleted-count");
    const totalCounter = document.getElementById("total-count");

    function updateCounters() {
      const completedTasks = document.querySelectorAll("#list-container li.completed").length;
      const uncompletedTasks = document.querySelectorAll("#list-container li:not(.completed)").length;
      const totalTasks = completedTasks + uncompletedTasks;

      completedCounter.textContent = completedTasks;
      uncompletedCounter.textContent = uncompletedTasks;
      totalCounter.textContent = totalTasks;
    }

    function addTask() {
      const task = inputBox.value.trim();
      if (!task) {
        alert("Please write down a task");
        return;
      }

      const li = document.createElement("li");
      li.setAttribute('role', 'listitem');
      li.innerHTML = `
        <label>
            <input type="checkbox">
            <span class="task-text">${task}</span>
        </label>
        <span class="edit-btn" tabindex="0" role="button" aria-label="Edit task">Edit</span>
        <span class="delete-btn" tabindex="0" role="button" aria-label="Delete task">Delete</span>
      `;

      listContainer.appendChild(li);
      inputBox.value = "";
      inputBox.focus();

      const checkbox = li.querySelector("input[type='checkbox']");
      const editBtn = li.querySelector(".edit-btn");
      const deleteBtn = li.querySelector(".delete-btn");
      const taskSpan = li.querySelector(".task-text");

      checkbox.addEventListener("change", function () {
        li.classList.toggle("completed", checkbox.checked);
        updateCounters();
      });

      editBtn.addEventListener("click", () => editTask(taskSpan, li, checkbox));
      editBtn.addEventListener("keypress", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          editTask(taskSpan, li, checkbox);
        }
      });

      deleteBtn.addEventListener("click", () => deleteTask(li));
      deleteBtn.addEventListener("keypress", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          deleteTask(li);
        }
      });

      updateCounters();
    }

    function editTask(taskSpan, li, checkbox) {
      const update = prompt("Edit task:", taskSpan.textContent);
      if (update !== null && update.trim() !== "") {
        taskSpan.textContent = update.trim();
        li.classList.remove("completed");
        checkbox.checked = false;
        updateCounters();
      }
    }

    function deleteTask(li) {
      if (confirm("Are you sure you want to delete this task?")) {
        li.remove();
        updateCounters();
      }
    }

    addButton.addEventListener("click", addTask);

    inputBox.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        addTask();
      }
    });

    updateCounters();
  })();