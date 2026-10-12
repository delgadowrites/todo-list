# Changelog

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