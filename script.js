// Confirms script.js is linked to index.html (debug line; remove before shipping)
console.log("JavaScript is connected!");

// ===== SUPABASE =====
const supabaseUrl = "https://cvaoxqryytupjobttubs.supabase.co";
const supabaseKey = "sb_publishable_hDjyedrZL_mjxZ3fxdEBew_jiOAdS34";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Sign in only if this browser has no saved session
async function signInIfNeeded() {
  const sessionResult = await supabaseClient.auth.getSession();
  if (sessionResult.data.session === null) {
    await supabaseClient.auth.signInAnonymously();
  }
}
signInIfNeeded();

// ===== PAGE ELEMENTS + WORKING LIST =====
// Grabs the text box where you type a new task
const taskInput = document.querySelector("#task-input");
// Grabs the form (Add button + Enter key both "submit" it)
const taskForm = document.querySelector("#task-form");
// Grabs the empty <ul> that holds every task (<li>)
const taskList = document.querySelector("#task-list");
// Working list of task objects { id, text, completed } while the page is open
const tasks = [];

// ===== LOAD SAVED TASKS WHEN THE PAGE OPENS =====
// Reads the saved tasks from localStorage as text (null on a first visit)
let storedTasks = localStorage.getItem("tasks");
// First visit: no saved text, so use the text of an empty array instead
if (storedTasks === null) {
  storedTasks = "[]";
}
// Turns the saved text back into an array of task objects
const storedTasksArray = JSON.parse(storedTasks);
// For each saved task object:
for (let task of storedTasksArray) {
  // Gives an id to tasks saved before ids existed (old data migration)
  if (task.id === undefined) {
    task.id = crypto.randomUUID();
  }
  // Rebuilds that task (<li>) on the page
  buildTask(task.text, task.completed, task.id);
  // Copies the task object into the working list
  tasks.push(task);
}

// ===== XP =====
// Grabs the XP line at the bottom of the page          → box xpDisplay
const xpDisplay = document.querySelector("#xp-display");
// How much XP one completed quest gives                → box xpPerQuest, 15
const xpPerQuest = 15;
// Reads saved XP as a number (first visit gives 0)     → box xp
let xp = Number(localStorage.getItem("xp"));
// Shows the XP total on the page                       → call showXp
showXp();

// Writes "XP: " and the total into xpDisplay           → function showXp
function showXp() {
  xpDisplay.textContent = "XP: " + xp;
}

// ===== BUILD ONE TASK (<li>) ON THE PAGE =====
// Creates a task (<li>) with its text and buttons, and adds it to the list
function buildTask(text, completed, taskId) {
  // Creates the task (<li>) and gives it the class "task"
  const newTask = document.createElement("li");
  newTask.classList.add("task");
  // Labels the task (<li>) with its id (data-id), to match it to its object later
  newTask.dataset.id = taskId;

  // add removeButton here
  const removeButton = document.createElement("button");
  removeButton.classList.add("remove-button");
  removeButton.textContent = "×";
  newTask.appendChild(removeButton);
  removeButton.setAttribute("aria-label", "Remove task");
  // Creates the <span> that holds the task's text, and puts it in the task (<li>)
  const spanWrapper = document.createElement("span");
  spanWrapper.classList.add("task-text");
  spanWrapper.textContent = text;
  newTask.appendChild(spanWrapper);
  // Creates the "complete" button, and puts it in the task (<li>)
  const completeButton = document.createElement("button");
  completeButton.classList.add("complete-button");
  completeButton.textContent = "complete";
  newTask.appendChild(completeButton);
  // Puts the finished task (<li>) into the list on the page
  taskList.appendChild(newTask);
}

// ===== ADD A NEW TASK (Add button or Enter) =====
taskForm.addEventListener("submit", (event) => {
  // Stops the form from reloading the page
  event.preventDefault();
  // Reads what was typed in the text box
  const taskText = taskInput.value;
  // Blocks blank or spaces-only tasks: clears the box and stops here
  if (taskText.trim() === "") {
    taskInput.value = "";
    return;
  }
  // Makes a unique id for the new task
  const taskId = crypto.randomUUID();
  // Builds the new task (<li>) on the page, not completed
  buildTask(taskText, false, taskId);
  // Adds the new task object to the working list
  tasks.push({ id: taskId, text: taskText, completed: false });
  // Saves the whole working list to localStorage as text
  localStorage.setItem("tasks", JSON.stringify(tasks));
  // Clears the text box for the next task
  taskInput.value = "";
});

// ===== CLICKS INSIDE THE LIST (one listener for every task) =====
taskList.addEventListener("click", (event) => {
  // --- Clicked a "remove" button: removes that task everywhere without granting xp ---
  if (event.target.classList.contains("remove-button")) {
    // Finds the task (<li>) the button is inside, and reads its id
    const clickedTask = event.target.parentElement;
    const clickedId = clickedTask.dataset.id;
    // Finds the position of the matching object in the working list (-1 = not found)
    const matchingIndex = tasks.findIndex((task) => task.id === clickedId);
    // Safety guard: no matching object, so stop without changing anything
    if (matchingIndex === -1) {
      return;
    }
    // Removes that object from the working list
    tasks.splice(matchingIndex, 1);
    // Removes the task (<li>) from the page
    clickedTask.remove();
    // Saves the updated working list to localStorage
    localStorage.setItem("tasks", JSON.stringify(tasks));
    // --- Clicked a "complete" button: removes that task everywhere ---
  } else if (event.target.classList.contains("complete-button")) {
    // Finds the task (<li>) the button is inside, and reads its id
    const clickedTask = event.target.parentElement;
    const clickedId = clickedTask.dataset.id;
    // Finds the position of the matching object in the working list (-1 = not found)
    const matchingIndex = tasks.findIndex((task) => task.id === clickedId);
    // Safety guard: no matching object, so stop without changing anything
    if (matchingIndex === -1) {
      return;
    }
    // Removes that object from the working list
    tasks.splice(matchingIndex, 1);
    // Removes the task (<li>) from the page
    clickedTask.remove();
    // Saves the updated working list to localStorage
    localStorage.setItem("tasks", JSON.stringify(tasks));
    // Adds one quest's XP to the total
    xp += xpPerQuest;
    // Saves the total under the key "xp"
    localStorage.setItem("xp", xp);
    // Shows the new total on the page
    showXp();
  } else {
    return;
  }
});