console.log("JavaScript is connected!");

// SELECT: grab the 3 elements JavaScript needs and store each in a labeled box
const taskInput = document.querySelector("#task-input"); // the text box (where the task text starts)
const taskForm = document.querySelector("#task-form");   // the form (fires "submit" on click or Enter)
const taskList = document.querySelector("#task-list");   // the list (where new tasks end up)

// LISTEN: when the form submits, the browser runs this callback
// and fills the "event" parameter with details about the submit
taskForm.addEventListener("submit", (event) => {
  // CHANGE 1: stop the browser's default reload, so the new task isn't wiped
  event.preventDefault();

  // CHANGE 2: copy the text the user typed
  const taskText = taskInput.value;

  // Guard: if the text is only spaces, clear text input then stop the callback here (nothing below runs)
  // (A completely empty box never gets this far: "required" in the HTML blocks it)
  if (taskText.trim() === "") {
    taskInput.value = "";
    return;
  }

  // CHANGE 3: create a brand-new <li> and give it the "task" class (connects it to the .task CSS)
  const newTask = document.createElement("li");
  newTask.classList.add("task");

  // CHANGE 4: put the text inside the new <li>
  newTask.textContent = taskText;

  // CHANGE 5: add the finished <li> to the list, so it appears on the page
  taskList.appendChild(newTask);

  // CHANGE 6: clear the text box for the next task
  taskInput.value = "";
});