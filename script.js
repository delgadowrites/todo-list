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
// Grabs the Add button
const addButton = document.querySelector("#add-button");
// Grabs the stat dropdown (which stat a new task trains)
const statInput = document.querySelector("#stat-input");

// ===== STAT PICKER (the button next to the task box) =====
// The button opens the picker by itself (popovertarget in the HTML).
// Here: choosing an option, and putting focus on the current choice when it opens.
const statButtonText = document.querySelector("#stat-button-text");
const statPicker = document.querySelector("#stat-picker");
const statOptions = document.querySelectorAll(".stat-option");

// Each option: clicking it (or Enter / Space on it) picks that stat
for (let option of statOptions) {
  option.addEventListener("click", () => {
    // Reads the stat from the option's data-stat label, like "INT"
    const chosenStat = option.dataset.stat;
    // Saves it in the hidden input (the add-task code reads it from there)
    statInput.value = chosenStat;
    // Shows it on the button
    statButtonText.textContent = chosenStat;
    // Marks only this option as chosen (aria-pressed tells screen readers, CSS styles it)
    for (let other of statOptions) {
      if (other === option) {
        other.setAttribute("aria-pressed", "true");
      } else {
        other.setAttribute("aria-pressed", "false");
      }
    }
    // Closes the picker (Esc or a click outside also closes it, for free)
    statPicker.hidePopover();
  });
}

// When the picker opens, puts keyboard focus on the stat that's chosen now
statPicker.addEventListener("toggle", (event) => {
  if (event.newState === "open") {
    statPicker.querySelector('[aria-pressed="true"]').focus();
  }
});
// Working list of task objects { id, text, completed, stat } while the page is open
const tasks = [];

// ===== CHARACTER SHEET (open / close) =====
// Grabs the Hero button, the sheet (<dialog>) and the sheet's × button
const heroButton = document.querySelector("#hero-button");
const heroSheet = document.querySelector("#hero-sheet");
const heroClose = document.querySelector("#hero-close");
// Hero button: fills in the latest numbers, then opens the sheet on top of the page
// (Esc also closes it). showHero is further down; function declarations work anywhere.
heroButton.addEventListener("click", () => {
  showHero();
  heroSheet.showModal();
});
// × button: closes the sheet
heroClose.addEventListener("click", () => {
  heroSheet.close();
});
// Clicking the dimmed area outside the sheet also closes it
// (a click on the backdrop reports the <dialog> itself as the target)
heroSheet.addEventListener("click", (event) => {
  if (event.target === heroSheet) {
    heroSheet.close();
  }
});

// ===== LOAD TASKS FROM SUPABASE =====
// Reads this user's tasks from the database and rebuilds them on the page
async function loadTasks() {
  // Asks Supabase for the id, text, completed and stat of each task, oldest first
  // (RLS only gives back rows whose user_id matches this browser's user)
  const loadResult = await supabaseClient
    .from("tasks")
    .select("id, text, completed, stat")
    .order("created_at");
  // If the request failed, shows the error in red in the Console and stops
  if (loadResult.error !== null) {
    console.error(loadResult.error);
    return;
  }
  // For each row (task object) the database gave back:
  for (let task of loadResult.data) {
    // Guard: a missing or unknown stat (old rows, typos in the database) becomes WIS
    if (!statNames.includes(task.stat)) {
      task.stat = "WIS";
    }
    // Rebuilds that task (<li>) on the page
    buildTask(task.text, task.completed, task.id, task.stat);
    // Copies the task object into the working list
    tasks.push(task);
  }
}

// ===== XP =====
// Grabs the XP line at the bottom of the page
const xpDisplay = document.querySelector("#xp-display");
// How much XP one completed quest gives
const xpPerQuest = 15;
// These are used to create the XP Bar
const xpLevel = document.querySelector("#xp-level");
const xpNumbers = document.querySelector("#xp-numbers");
const xpFill = document.querySelector("#xp-fill");
// Reads saved XP as a number (first visit gives 0)
let xp = Number(localStorage.getItem("xp"));

// JRPG forumla for leveling up
function xpToLevelUp(level) {
  return 40 + (15 * level) + (5 * level ** 2);
}

// egde case 1 check
if (Number.isFinite(xp)) {
  if (xp < 0) {
    xp = 0;
  }
} else {
  xp = 0;
}

// Shows the XP total on the page
showXp();

// Turns a total XP number into { level, xpIntoLevel, xpNeeded }
// Used by the hero level AND by each stat, so they all level up the same way
function levelFromXp(totalXp) {
  // Start at level 1 with all the XP still "in the bank"
  let level = 1;
  let xpIntoLevel = totalXp;
  // While the bank is enough to level up: pay for the level and go up one
  while (xpIntoLevel >= xpToLevelUp(level)) {
    xpIntoLevel -= xpToLevelUp(level);
    level += 1;
  }
  // Hands back all three numbers in one object
  return { level: level, xpIntoLevel: xpIntoLevel, xpNeeded: xpToLevelUp(level) };
}

// Shows current level, total XP needed to level up, and current banked XP
function showXp() {
  // Works out the level from the saved xp
  const progress = levelFromXp(xp);
  // Shows the level, the "50 / 180 XP" numbers, and how full the bar is (as a %)
  xpLevel.textContent = "LV " + progress.level;
  xpNumbers.textContent = progress.xpIntoLevel + " / " + progress.xpNeeded + " XP";
  xpFill.style.width = (progress.xpIntoLevel / progress.xpNeeded) * 100 + "%";
}

// ===== HERO DATA (saved in localStorage under "hero") =====
// The five stats, in the order they appear on the sheet
const statNames = ["STR", "INT", "CRE", "CHA", "WIS"];
// Titles by hero level: you get the last title whose minLevel you've reached
const heroTitles = [
  { minLevel: 1, title: "Novice" },
  { minLevel: 3, title: "Adventurer" },
  { minLevel: 5, title: "Hero" },
  { minLevel: 10, title: "Champion" },
  { minLevel: 20, title: "Legend" },
];

// Makes a brand-new hero (first visit, or saved data was broken)
function newHero() {
  return {
    name: "Lil Dude",
    questsDone: 0,
    statXp: { STR: 0, INT: 0, CRE: 0, CHA: 0, WIS: 0 },
  };
}

// Returns n if it's a normal number 0 or more, otherwise 0 (same idea as the xp guard)
function safeCount(n) {
  if (Number.isFinite(n) && n >= 0) {
    return n;
  }
  return 0;
}

// Reads the saved hero, fixing anything missing or broken piece by piece
function loadHero() {
  // Starts from a fresh hero; saved values are copied over it only if they're OK
  const loaded = newHero();
  // Reads the saved text (null on the first visit)
  const savedText = localStorage.getItem("hero");
  if (savedText === null) {
    return loaded;
  }
  // JSON.parse throws an error on broken text, so try/catch keeps the page alive
  let saved;
  try {
    saved = JSON.parse(savedText);
  } catch (error) {
    console.error("Saved hero was broken, starting fresh:", error);
    return loaded;
  }
  // Saved data must be an object (not null, a number, a list...)
  if (typeof saved !== "object" || saved === null || Array.isArray(saved)) {
    return loaded;
  }
  // Name: must be text with something in it
  if (typeof saved.name === "string" && saved.name.trim() !== "") {
    loaded.name = saved.name;
  }
  // Quest count: must be a normal number 0 or more
  loaded.questsDone = safeCount(saved.questsDone);
  // Each stat's XP: must be a normal number 0 or more
  if (typeof saved.statXp === "object" && saved.statXp !== null) {
    for (let stat of statNames) {
      loaded.statXp[stat] = safeCount(saved.statXp[stat]);
    }
  }
  return loaded;
}

// Saves the hero as text (localStorage only stores text)
function saveHero() {
  localStorage.setItem("hero", JSON.stringify(hero));
}

// The hero while the page is open
const hero = loadHero();

// ===== DRAW THE CHARACTER SHEET =====
// Grabs the parts of the sheet that change
const heroName = document.querySelector("#hero-name");
const heroTitle = document.querySelector("#hero-title");
const sheetLevel = document.querySelector("#sheet-level");
const sheetFill = document.querySelector("#sheet-fill");
const sheetNumbers = document.querySelector("#sheet-numbers");
const questsDoneDisplay = document.querySelector("#quests-done");
const bestStatDisplay = document.querySelector("#best-stat");

// Fills in the sheet from the hero object and the saved xp
function showHero() {
  // Name, and the title that matches the hero's level
  const progress = levelFromXp(xp);
  heroName.textContent = hero.name;
  for (let rank of heroTitles) {
    if (progress.level >= rank.minLevel) {
      heroTitle.textContent = rank.title;
    }
  }
  // Hero level bar (same numbers as the bar at the bottom of the page)
  sheetLevel.textContent = "LV " + progress.level;
  sheetNumbers.textContent = progress.xpIntoLevel + " / " + progress.xpNeeded + " XP";
  sheetFill.style.width = (progress.xpIntoLevel / progress.xpNeeded) * 100 + "%";

  // Each stat row: finds the <li> labeled data-stat="STR" (etc.) and fills it in
  for (let stat of statNames) {
    const statProgress = levelFromXp(hero.statXp[stat]);
    const row = document.querySelector('.stat[data-stat="' + stat + '"]');
    row.querySelector(".stat-level").textContent = "LV " + statProgress.level;
    row.querySelector(".mini-fill").style.width =
      (statProgress.xpIntoLevel / statProgress.xpNeeded) * 100 + "%";
  }

  // Record: quest count, and the stat with the most XP ("—" until one has any)
  questsDoneDisplay.textContent = hero.questsDone;
  let bestStat = "—";
  let bestXp = 0;
  for (let stat of statNames) {
    if (hero.statXp[stat] > bestXp) {
      bestStat = stat;
      bestXp = hero.statXp[stat];
    }
  }
  bestStatDisplay.textContent = bestStat;
}

// ===== RENAME THE HERO (from the character sheet) =====
// Grabs the name row (name + edit button), the rename form, and its text box
const nameRow = document.querySelector("#name-row");
const renameButton = document.querySelector("#rename-button");
const renameForm = document.querySelector("#rename-form");
const renameInput = document.querySelector("#rename-input");

// Swaps the name row for the form, with the current name ready to edit
function startRenaming() {
  renameInput.value = hero.name;
  nameRow.hidden = true;
  renameForm.hidden = false;
  // Puts the cursor in the box and selects the old name, so typing replaces it
  renameInput.focus();
  renameInput.select();
}

// Swaps back to the name row without saving anything
function stopRenaming() {
  renameForm.hidden = true;
  nameRow.hidden = false;
}

// edit button: starts renaming
renameButton.addEventListener("click", startRenaming);

// Save button or Enter: saves the new name
renameForm.addEventListener("submit", (event) => {
  // Stops the form from reloading the page
  event.preventDefault();
  // Removes spaces at the start and end
  const newName = renameInput.value.trim();
  // Blank (or spaces only): keeps the old name; anything else becomes the new name
  if (newName !== "") {
    hero.name = newName;
    saveHero();
  }
  stopRenaming();
  showHero();
  // Puts focus back on the edit button, so keyboard users don't get lost
  renameButton.focus();
});

// Esc normally closes the whole sheet. While renaming, it only cancels the rename.
// (Esc fires a "cancel" event on the <dialog>; preventDefault keeps the sheet open)
heroSheet.addEventListener("cancel", (event) => {
  if (!renameForm.hidden) {
    event.preventDefault();
    stopRenaming();
    renameButton.focus();
  }
});

// If the sheet closes mid-rename (× or a click outside), the next open starts fresh
heroSheet.addEventListener("close", stopRenaming);

// ===== LEVEL-UP FLASH =====
// Grabs the XP bar track (it glows on a level-up)
const xpBar = document.querySelector("#xp-bar");

// Shows a banner above the XP line (one line per level-up) and makes the bar glow
function showLevelUp(lines) {
  // Builds the banner, one line per message ("\n" + white-space: pre-line in the CSS)
  const banner = document.createElement("span");
  banner.classList.add("level-up-banner");
  banner.textContent = lines.join("\n");
  // role="status" makes screen readers announce the level-up
  banner.setAttribute("role", "status");
  xpDisplay.appendChild(banner);
  // Same clean-up as the +XP float: remove the banner when its animation ends
  banner.addEventListener("animationend", () => {
    banner.remove();
  });

  // Makes the bar glow, then takes the class off so the next level-up can glow again
  xpBar.classList.add("level-up-glow");
  xpBar.addEventListener(
    "animationend",
    () => {
      xpBar.classList.remove("level-up-glow");
    },
    { once: true } // the listener removes itself after running one time
  );
}

// ===== BUILD ONE TASK (<li>) ON THE PAGE =====
// Creates a task (<li>) with its text and buttons, and adds it to the list
function buildTask(text, completed, taskId, stat) {
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
  // Creates the stat badge (like "INT") and puts it at the start of the text,
  // so the badge and text wrap together and the text keeps the full width on phones
  const statBadge = document.createElement("span");
  statBadge.classList.add("stat-badge");
  statBadge.textContent = stat;
  spanWrapper.prepend(statBadge);
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
  // Turns Add Button off
  addButton.disabled = true;
  // Reads which stat was picked in the dropdown
  const taskStat = statInput.value;
  // Makes a unique id for the new task
  const taskId = crypto.randomUUID();
  // Saves the task to the database (user_id is filled in by the database)
  const insertResult = await supabaseClient
    .from("tasks")
    .insert({ id: taskId, text: taskText, stat: taskStat });
  // Turns Add Button back on
  addButton.disabled = false;
  // If the save failed, shows the error and stops (the text stays in the box)
  if (insertResult.error !== null) {
    console.error(insertResult.error);
    return;
  }
  // Builds the new task (<li>) on the page, not completed
  buildTask(taskText, false, taskId, taskStat);
  // Adds the new task object to the working list
  tasks.push({ id: taskId, text: taskText, completed: false, stat: taskStat });
  // Clears the text box for the next task, but only if it still holds the text we
  // just saved. If you started typing the next task while this one was saving,
  // your new text is kept. (The stat stays picked, handy for a batch of the same kind.)
  if (taskInput.value === taskText) {
    taskInput.value = "";
  }
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
    // Reads which stat this task trains (before the object leaves the working list)
    const completedStat = tasks[matchingIndex].stat;
    // Removes that object from the working list
    tasks.splice(matchingIndex, 1);
    // Removes the task (<li>) from the page
    clickedTask.remove();
    // Remembers the levels BEFORE the XP is added, to spot a level-up afterwards
    const heroLevelBefore = levelFromXp(xp).level;
    const statLevelBefore = levelFromXp(hero.statXp[completedStat]).level;
    // Adds one quest's XP to the total
    xp += xpPerQuest;
    // Saves the total under the key "xp"
    localStorage.setItem("xp", xp);
    // Shows the new total on the page
    showXp();
    // Trains the hero: the task's stat gets the same XP, and the quest is counted
    hero.statXp[completedStat] += xpPerQuest;
    hero.questsDone += 1;
    saveHero();
    // Compares the levels AFTER: any that went up gets a line in the level-up banner
    const levelUps = [];
    const heroLevelAfter = levelFromXp(xp).level;
    const statLevelAfter = levelFromXp(hero.statXp[completedStat]).level;
    if (heroLevelAfter > heroLevelBefore) {
      levelUps.push("LEVEL UP! LV " + heroLevelAfter);
    }
    if (statLevelAfter > statLevelBefore) {
      levelUps.push(completedStat + " LV " + statLevelAfter + "!");
    }
    if (levelUps.length > 0) {
      showLevelUp(levelUps);
    }

    //=======Xp Animation Effect========
    // make a new span in a box called xpFloat
    const xpFloat = document.createElement("span");
    // give xp float the class xp-float
    xpFloat.classList.add("xp-float");
    // give xpFloat the text "+15 XP · INT" (the XP, then the stat it trained)
    xpFloat.textContent = "+" + xpPerQuest + " XP · " + completedStat;
    // Put xpFloat inside xpDisplay
    xpDisplay.appendChild(xpFloat);
    // Listen on xpFloat for the animationend event
    xpFloat.addEventListener("animationend", () => {
      // When it fires, remove xpFloat itself (not its parent)
      xpFloat.remove();
    });


    // --- Clicked anything else in the list: does nothing ---
  } else {
    return;
  }
});

// ===== MOVE OLD LOCALSTORAGE TASKS INTO SUPABASE (runs once per browser) =====
async function migrateLocalTasks() {
  // Reads tasks saved by the old version of the app (null if there are none)
  const storedTasks = localStorage.getItem("tasks");
  // Nothing saved: stops here
  if (storedTasks === null) {
    return;
  }
  // Turns the saved text back into an array of task objects
  const storedTasksArray = JSON.parse(storedTasks);
  // Empty array saved: removes the key and stops
  if (storedTasksArray.length === 0) {
    localStorage.removeItem("tasks");
    return;
  }
  // Builds one row per old task (user_id is filled in by the database)
  const rows = [];
  for (let task of storedTasksArray) {
    // Gives an id to tasks saved before ids existed
    if (task.id === undefined) {
      task.id = crypto.randomUUID();
    }
    rows.push({ id: task.id, text: task.text });
  }
  // Saves all the rows in one request
  const migrateResult = await supabaseClient.from("tasks").insert(rows);
  // If the save failed: shows the error and KEEPS localStorage (nothing is lost)
  if (migrateResult.error !== null) {
    console.error(migrateResult.error);
    return;
  }
  // Saved: removes the old key so this never runs twice
  localStorage.removeItem("tasks");
}

// ===== START THE APP =====
// Signs in first, then loads tasks (a read before sign-in gives back [])
async function startApp() {
  await signInIfNeeded();
  await migrateLocalTasks();
  await loadTasks();
}
// Runs at the end of the file, so taskList, tasks and buildTask already exist
startApp();