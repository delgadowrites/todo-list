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
// signInIfNeeded();

// ===== PAGE ELEMENTS + WORKING LIST =====
// Grabs the text box where you type a new task
const taskInput = document.querySelector("#task-input");
// Grabs the form (Add button + Enter key both "submit" it)
const taskForm = document.querySelector("#task-form");
// Grabs the empty <ul> that holds every task (<li>)
const taskList = document.querySelector("#task-list");
// Working list of task objects { id, text, completed } while the page is open
const tasks = [];

// ===== LOAD TASKS FROM SUPABASE =====
// Reads this user's tasks from the database and rebuilds them on the page
async function loadTasks() {
  // Asks Supabase for the id, text and completed of each task, oldest first
  // (RLS only gives back rows whose user_id matches this browser's user)
  const loadResult = await supabaseClient
    .from("tasks")
    .select("id, text, completed")
    .order("created_at");
  // If the request failed, shows the error in red in the Console and stops
  if (loadResult.error !== null) {
    console.error(loadResult.error);
    return;
  }
  // For each row (task object) the database gave back:
  for (let task of loadResult.data) {
    // Rebuilds that task (<li>) on the page
    buildTask(task.text, task.completed, task.id);
    // Copies the task object into the working list
    tasks.push(task);
  }
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
// async: this listener waits for the database before changing the page
taskForm.addEventListener("submit", async (event) => {
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
  // Saves the task to the database (user_id is filled in by the database)
  const insertResult = await supabaseClient
    .from("tasks")
    .insert({ id: taskId, text: taskText });
  // If the save failed, shows the error and stops (the text stays in the box)
  if (insertResult.error !== null) {
    console.error(insertResult.error);
    return;
  }
  // Builds the new task (<li>) on the page, not completed
  buildTask(taskText, false, taskId);
  // Adds the new task object to the working list
  tasks.push({ id: taskId, text: taskText, completed: false });
  // Clears the text box for the next task
  taskInput.value = "";
});

// ===== CLICKS INSIDE THE LIST (one listener for every task) =====
// async: this listener waits for the database before changing the page
taskList.addEventListener("click", async (event) => {
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
    // Blocks a second tap while the database answers
    event.target.disabled = true;
    // Deletes the row whose id matches this task
    const deleteResult = await supabaseClient
      .from("tasks")
      .delete()
      .eq("id", clickedId);
    // If the delete failed: shows the error, re-enables the button, and stops
    if (deleteResult.error !== null) {
      console.error(deleteResult.error);
      event.target.disabled = false;
      return;
    }
    // Removes that object from the working list
    tasks.splice(matchingIndex, 1);
    // Removes the task (<li>) from the page
    clickedTask.remove();

    // --- Clicked a "complete" button: removes that task everywhere and grants xp ---
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
    // Blocks a second tap while the database answers (no double XP)
    event.target.disabled = true;
    // Deletes the row whose id matches this task
    const deleteResult = await supabaseClient
      .from("tasks")
      .delete()
      .eq("id", clickedId);
    // If the delete failed: shows the error, re-enables the button, and stops (no XP)
    if (deleteResult.error !== null) {
      console.error(deleteResult.error);
      event.target.disabled = false;
      return;
    }
    // Removes that object from the working list
    tasks.splice(matchingIndex, 1);
    // Removes the task (<li>) from the page
    clickedTask.remove();
    // Adds one quest's XP to the total
    xp += xpPerQuest;
    // Saves the total under the key "xp"
    localStorage.setItem("xp", xp);
    // Shows the new total on the page
    showXp();

    // --- Clicked anything else in the list: does nothing ---
  } else {
    return;
  }
});

// ===== START THE APP =====
// Signs in first, then loads tasks (a read before sign-in gives back [])
async function startApp() {
  await signInIfNeeded();
  await loadTasks();
}
// Runs at the end of the file, so taskList, tasks and buildTask already exist
startApp();