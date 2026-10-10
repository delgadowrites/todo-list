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