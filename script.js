console.log("JavaScript is connected!");

const taskInput = document.querySelector("#task-input");
const taskForm = document.querySelector("#task-form");
const taskList = document.querySelector("#task-list");
const tasks = [];

// LOAD SAVED TASKS (runs once, when the page opens; outside any listener)
// Data flow: starts at localStorage → goes to buildTask → ends up at #task-list on the page
// What could break:
//   1. First visit, nothing saved → getItem gives back null → loop errors → script stops → listeners never attach
//   2. Refresh, then add → loaded tasks aren't in tasks → setItem replaces the save → old tasks are lost
//   (smaller: wrong key; code running before the boxes it needs exist)

// 1. Get the saved text from localStorage using the key "tasks" → put it in storedTasks
let storedTasks = localStorage.getItem("tasks");
// 1b. If nothing is saved (storedTasks is null), use "[]": an empty array written as text, so JSON.parse can read it.
if (storedTasks === null) {
  storedTasks = "[]";
}
// 2. Turn that text back into an array → put it in storedTasksArray
const storedTasksArray = JSON.parse(storedTasks);
// 3. For each task in that array:
for (let task of storedTasksArray) {
  // 8c-4a, line 6. If this task has no id (old saved task), give it a new one (before buildTask, so the <li> gets the same id)
  if (task.id === undefined) {
    task.id = crypto.randomUUID();
  }
  // 4. Call buildTask, giving it the task's text, completed status and id
  buildTask(task.text, task.completed, task.id);
  // 5. Put this task into the box tasks
  tasks.push(task);
}

// 8c-4a: EVERY TASK HAS AN ID
// Data flow: starts at crypto.randomUUID() → goes to the object in tasks (then storage) and to buildTask → ends up on the <li>
// What could break: old saved tasks have no id → task.id is undefined → give them one when loading

// 8c-4a, line 5. Add a third parameter named taskId; put it on the <li> as its data-id label
function buildTask(text, completed, taskId) {
  const newTask = document.createElement("li");
  newTask.classList.add("task");
  // 8c-4a, line 5 (continued). Put taskId on newTask as its data-id label
  newTask.dataset.id = taskId;
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
  // 8c-4a, line 1. Create a new id → put it in a box named taskId
  const taskId = crypto.randomUUID();
  // 8c-4a, line 2. Call buildTask with taskText, false, and taskId
  buildTask(taskText, false, taskId);
  // 8c-4a, line 3. Push { id: taskId, text: taskText, completed: false } into tasks
  tasks.push({ id: taskId, text: taskText, completed: false });
  // 8c-4a, line 4. Save tasks (unchanged)
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