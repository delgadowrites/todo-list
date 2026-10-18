console.log("JavaScript is connected!");

const taskInput = document.querySelector("#task-input");
const taskForm = document.querySelector("#task-form");
const taskList = document.querySelector("#task-list");
const tasks = [];

let storedTasks = localStorage.getItem("tasks");
if (storedTasks === null) {
  storedTasks = "[]";
}
const storedTasksArray = JSON.parse(storedTasks);
for (let task of storedTasksArray) {
  if (task.id === undefined) {
    task.id = crypto.randomUUID();
  }
  buildTask(task.text, task.completed, task.id);
  tasks.push(task);
}

function buildTask(text, completed, taskId) {
  const newTask = document.createElement("li");
  newTask.classList.add("task");
  newTask.dataset.id = taskId;
  if (completed === true) {
    newTask.classList.add("completed");
  }
  const spanWrapper = document.createElement("span");
  spanWrapper.classList.add("task-text");
  spanWrapper.textContent = text;
  newTask.appendChild(spanWrapper);
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.textContent = "complete";
  newTask.appendChild(deleteButton);
  taskList.appendChild(newTask);
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const taskText = taskInput.value;
  if (taskText.trim() === "") {
    taskInput.value = "";
    return;
  }
  const taskId = crypto.randomUUID();
  buildTask(taskText, false, taskId);
  tasks.push({ id: taskId, text: taskText, completed: false });
  localStorage.setItem("tasks", JSON.stringify(tasks));
  taskInput.value = "";
});

taskList.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-button")) {
    const parent = event.target.parentElement;
    parent.remove();
  } else if (event.target.classList.contains("task-text")) {
    const clickedTask = event.target.parentElement;
    const clickedId = clickedTask.dataset.id;
    const matchingTask = tasks.find((task) => task.id === clickedId);
    if (matchingTask === undefined) {
      return;
    }
    matchingTask.completed = !matchingTask.completed;
    clickedTask.classList.toggle("completed");
    localStorage.setItem("tasks", JSON.stringify(tasks));
  } else {
    return;
  }
});