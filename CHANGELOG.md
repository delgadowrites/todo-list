# Changelog

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