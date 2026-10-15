console.log("JavaScript is connected!");

const taskInput = document.querySelector("#task-input");
const taskForm = document.querySelector("#task-form");
const taskList = document.querySelector("#task-list");
const tasks = [];

// This loads saved tasks from localStorage
let storedTasks = localStorage.getItem("tasks");
// 1b. If nothing is saved (storedTasks is null), use "[]": an empty array written as text, so JSON.parse can read it.
if (storedTasks === null) {
  storedTasks = "[]";
}
const storedTasksArray = JSON.parse(storedTasks);
for (let task of storedTasksArray) {
  buildTask(task.text, task.completed);
  tasks.push(task); // 5. Put this TASK into the box tasks. Not the entire array.
}

function buildTask(text, completed) {
  const newTask = document.createElement("li");
  newTask.classList.add("task");
  if (completed === true) {
    newTask.classList.add("completed");
  } // no ; after a block's }
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
  buildTask(taskText, false);
  tasks.push({ text: taskText, completed: false });
  localStorage.setItem("tasks", JSON.stringify(tasks));
  taskInput.value = "";
});

taskList.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-button")) {
    const parent = event.target.parentElement;
    parent.remove();
  } else if (event.target.classList.contains("task-text")) {
    event.target.parentElement.classList.toggle("completed");
  } else {
    return;
  }
});