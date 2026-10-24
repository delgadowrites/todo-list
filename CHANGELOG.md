# Changelog

## 2026-10-23

### Added
- Levels: the XP needed for each level grows with the formula 40 + 15L + 5L² (60 XP for level 1 → 2). Level and progress are calculated from the saved XP total every time.
- XP bar pinned to the bottom of the page: `LV 4`, a bar that fills toward the next level, and `50 / 180 XP`.

### Changed
- The bottom line shows the level, bar and progress instead of `XP: 45`.

## 2026-10-21

### Added
- Supabase Postgres backend for tasks: `tasks` table with `id` (uuid), `user_id`, `text`, `completed`, `created_at`.
- Row Level Security policies: each browser can read, add, update and delete only its own tasks (`user_id = auth.uid()`).
- Anonymous sign-in: each browser gets its own user on its first visit; the session is kept across refreshes.
- Supabase JavaScript client, loaded from the jsDelivr CDN.
- One-time migration: tasks saved in localStorage by the old version are copied into Supabase, then removed from localStorage.

### Changed
- Tasks load from Supabase when the page opens (sign-in first, then oldest task first).
- Adding a task saves it to Supabase before it appears on the page.
- × and complete delete the task in Supabase before removing it from the page; complete gives XP only after the delete succeeds.
- XP stays in localStorage.

### Fixed
- Double-tapping complete could give XP twice: the button is disabled while the database answers.
- The `supabase-backend` branch was missing the XP commits from main: merged main into the branch.

## 2026-10-20

### Added
- Red × button on every task: removes the task (page, list and saved data) without XP. Top-left corner, 44 px tap area, `aria-label="Remove task"`.
- XP: tapping complete gives +15 XP. The total is saved in localStorage under `"xp"` and shown in a line pinned to the bottom of the screen.

### Changed
- Completing a task is one tap: complete removes the task and gives XP (Turn In + undo dropped for now).
- Retired the cross-out: clicking a task's text does nothing; removed the `.completed` style.
- Task layout: `min-height: 48px` and left padding to make room for the ×; removed the task list's left padding for more text room on phones.

### Fixed
- iPhone Safari zoomed in when tapping the task box: task input font size is now 16px.

## 2026-10-18

### Added
- Crossing out a task now saves: the click finds the task's object by id, flips completed, and saves
- Deleting a task now saves: the click finds the object's index by id, removes it from tasks, and saves
- Guards on both: if a task's id has no match, the click does nothing (no error, page and data stay in sync)

### Changed
- Renamed the delete-button class to complete-button (JS and CSS)
- Removed plan comments from script.js

## 2026-10-16

### Added
- Every task gets a unique id from crypto.randomUUID(), stored on its object (id key) and on its <li> (data-id)
- Migration: tasks saved before ids existed get an id when they load, before they're drawn

## 2026-10-15

### Added
- Load saved tasks from localStorage when the page opens and rebuild each one with buildTask
- First-visit guard: use "[]" when nothing is saved, so the script doesn't crash and the listeners still attach

### Fixed
- Adding a task after a refresh no longer overwrites the saved list (loaded tasks are pushed into tasks)

## 2026-10-14

### Added
- A `tasks` array that holds each task's data as `{ text, completed }`.
- Adding a task now pushes its data into `tasks` and saves the array to `localStorage` under the key `"tasks"` (with `JSON.stringify`).

### Changed
- Task button label changed from "delete" to "complete" (it still removes the task).
- Corrected a comment in `buildTask` about semicolons after blocks.

## 2026-10-13

### Changed
- Moved the code that builds a task (li, text span, delete button) into a reusable `buildTask(text, completed)` function.
- The submit listener now calls `buildTask(taskText, false)` instead of building the task itself.
- `buildTask` adds the `completed` class when `completed` is `true` (prepares for loading saved tasks in Step 8).

## 2026-10-12

### Added
- Each task's text is wrapped in its own `<span class="task-text">`

### Changed
- Delete button is positioned with flexbox: text on the left, button on the right, vertically centered (`.task`: `justify-content: space-between`, `gap`; `.delete-button`: `flex-shrink: 0`)
- Crossed-out style now targets only the text: `.completed .task-text` (was `.completed`)
- Toggle branch checks for `task-text` and toggles `completed` on the span's parent `<li>`

### Fixed
- Delete button jumped down when clicked: its `:active` transform replaced the centering transform. Removed absolute positioning.
- Crossing out a task also crossed out the delete button text
- Span never got its class: `classList.add = "task-text"` (assignment) changed to `classList.add("task-text")` (method call)

## 2026-10-11

### Added
- A delete button inside every task; clicking it removes only that task
- The task list's click listener now handles two kinds of clicks: delete button → remove the task; task → toggle crossed out
- Comments for the delete-button code and the click listener's three branches
- Delete button styling (`.delete-button`): pixel font and palette colors

### Changed
- Toggle now uses `classList.toggle("completed")` (one line instead of if/else)

### Fixed
- Toggle broke with "targetElement is not defined" (a name copied from an example) and then "newTask is not defined" (a box from another callback). Fixed with `event.target`.
- Delete button did nothing: the click check looked for `"delete-task"` instead of `"delete-button"`

## 2026-10-10

### Added
- Click a task to cross it out; click again to un-cross it
- One click listener on `#task-list` handles every task, including ones added later (event delegation)
- Guard: clicks on the list's empty space are ignored
- `.completed` style: a 3px line through the text in `--color-accent-3`
- Temporary `console.log(event.target)` for debugging (remove before shipping)

### Fixed
- Crossed-out tasks couldn't be un-crossed: the "add completed" line ran on every click. Moved it into an `else` block.

## 2026-10-08

### Added
- Form submit listener in `script.js`: typing a task and clicking Add (or pressing Enter) adds it to the list
- New tasks are created as `<li class="task">`, so they get the task styling
- Text box clears after each task is added
- Guard against spaces-only input: nothing is added, and the box is cleared
- Comments above each part of `script.js` explaining what it does

### Changed
- Page no longer reloads when the form is submitted (`event.preventDefault()`)

### Fixed
- New tasks had no styling in the practice version: the class was `task-item` instead of `task`

### Removed
- Temporary test task (`<li class="task">Test task</li>`) from `index.html`

## 2026-10-06

### Added
- Press Start 2P font links (copied from the portfolio)
- Favicon (`lildude.png`)
- CSS palette variables in `:root` (copied from the portfolio)
- Page styling: pixel font, background color, text color on `body`
- Text box styling (`#task-input`): pixel font, colors, border, padding, 12px text
- Add button styling (`#add-button`): pixel font, colors, border, padding, 12px text, hover color flip, press effect
- Task list styling (`#task-list`): no markers, default indent kept, 32px space below the form
- Task styling (`.task`): background, accent text, accent border, padding, space between tasks
- `class="task"` on the test task

### Changed
- Add button: `<input type="submit">` → `<button type="submit" id="add-button">`
- Body text color to `--color-accent-2` for better contrast (about 4.6 : 1)

### Fixed
- Text box and button didn't use the pixel font (form controls don't inherit fonts; added `font-family: inherit`)
- Add button selector: `button` → `#add-button`, so future delete buttons don't get its styles
- List selector: `ul` → `#task-list`

## 2026-10-05

### Added
- Project files: `index.html`, `style.css`, `script.js`, `.gitignore` (ignores `.DS_Store`)
- HTML starter linking `style.css` and `script.js`
- Temporary `console.log` message confirming `script.js` is connected (remove before shipping)
- Git repo connected to GitHub; first commit pushed
- HTML skeleton: heading, form (`#task-form`) with a labeled text input (`#task-input`, required) and an "Add to list!" submit button, and a task list (`#task-list`)
- Temporary test task in the list for styling (remove before Step 3)

### Changed
- Moved `<meta charset>` to the top of `<head>` so the browser knows the encoding before reading the title

### Fixed
- Form tag: removed leftover `action`, `method` and stray `get` from an MDN example; changed `class="task-form"` to `id="task-form"`