# Changelog

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