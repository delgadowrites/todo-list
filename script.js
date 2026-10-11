console.log("JavaScript is connected!");

const taskInput = document.querySelector("#task-input");
const taskForm = document.querySelector("#task-form");
const taskList = document.querySelector("#task-list");

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const taskText = taskInput.value;
  if (taskText.trim() === "") {
    taskInput.value = "";
    return;
  }

  const newTask = document.createElement("li");
  newTask.classList.add("task");
  newTask.textContent = taskText;
  taskList.appendChild(newTask);
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.textContent = "delete";
  newTask.appendChild(deleteButton);
  taskInput.value = "";
});

taskList.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-button")) {
    const parent = event.target.parentElement;
    parent.remove();
  } else if (event.target.classList.contains("task")) {
    event.target.classList.toggle("completed");
  } else {
    return;
  }
});