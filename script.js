const form = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskDate = document.querySelector("#task-date");
const taskPriority = document.querySelector("#task-priority");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const totalCount = document.querySelector("#total-count");
const remainingCount = document.querySelector("#remaining-count");
const completedCount = document.querySelector("#completed-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem("studentTodoTasks")) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem("studentTodoTasks", JSON.stringify(tasks));
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  tasks.unshift({
    id: createId(),
    title,
    dueDate: taskDate.value,
    priority: taskPriority.value,
    completed: false
  });

  saveTasks();
  renderTasks();
  form.reset();
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00`);
  return `Due ${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function renderTasks() {
  taskList.innerHTML = "";
  const visibleTasks = tasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.title} as completed`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const content = document.createElement("div");
    content.className = "task-content";
    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;
    content.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "task-meta";
    if (task.dueDate) {
      const due = document.createElement("span");
      due.textContent = formatDate(task.dueDate);
      meta.appendChild(due);
    }
    const priority = document.createElement("span");
    priority.className = `priority ${task.priority}`;
    priority.textContent = `${task.priority[0].toUpperCase()}${task.priority.slice(1)} priority`;
    meta.appendChild(priority);
    content.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.className = "icon-button";
    editButton.type = "button";
    editButton.textContent = "✏️";
    editButton.title = "Edit task";
    editButton.setAttribute("aria-label", `Edit ${task.title}`);
    editButton.addEventListener("click", () => {
      const updated = prompt("Edit task:", task.title);
      if (updated === null) return;
      if (updated.trim()) {
        task.title = updated.trim();
        saveTasks();
        renderTasks();
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "icon-button";
    deleteButton.type = "button";
    deleteButton.textContent = "🗑️";
    deleteButton.title = "Delete task";
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    actions.append(editButton, deleteButton);
    item.append(checkbox, content, actions);
    taskList.appendChild(item);
  });

  emptyState.hidden = visibleTasks.length > 0;
  totalCount.textContent = tasks.length;
  remainingCount.textContent = tasks.filter((task) => !task.completed).length;
  completedCount.textContent = tasks.filter((task) => task.completed).length;
}

renderTasks();
