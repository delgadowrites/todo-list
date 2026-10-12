/*
Data flow: starts at task → bubbles to taskList → ends up at task (its class changes)

What could break: clicking empty space in the list adds "completed" to the list itself,
and every task gets crossed out

CSS (in style.css):
  .completed (or .task.completed) → text-decoration: line-through;

SELECT:
  Already have: taskList (no new Select needed)

LISTEN:
  Listen to taskList for the "click" event (event delegation)

CHANGE (what the callback does, in order):
  1. Use the event to find which element was clicked
  2. Is it a task (does it have the class "task")? If no, return
  3. Check if the task has the "completed" class
  4. If so, remove it
  5. Else, add the "completed" class
*/

/*
Data flow: starts at button → bubbles to task list → ends up deleting task item

What could break: delete button ends up deleting all tasks. Clicking on something besides button triggers deletion of tasks. Delete button crosses out task. Toggling cross-out triggers deletion.

PART A: in the submit callback (after the <li> gets its class and text)
  A1. Create a button
  A2. Give it the class delete-button
  A3. Give it text the user will see: delete
  A4. Put the button inside task

PART B: the taskList click listener
  B1. If the clicked element has the class delete-button:
        delete parent of button
  B2. Else, if the clicked element has the class task:
        toggle "completed" (your Step 6 code)
  B3. Otherwise: return
*/