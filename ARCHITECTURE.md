# Collaborative Canvas Architecture

## 1. Overview
This is a real-time collaborative drawing application built with **Node.js** and **Socket.io**. It allows multiple users to draw on a shared canvas simultaneously with synchronized history and undo functionality.

## 2. Tech Stack
- **Frontend:** HTML5 Canvas API (No libraries), Vanilla JS, CSS3.
- **Backend:** Node.js, Express.
- **Communication:** WebSockets via Socket.io (Events: `draw_line`, `history_sync`, `undo`, `cursor_move`).

## 3. Data Flow
1. **Input:** User draws a stroke (Input -> Mouse/Touch coordinates).
2. **Local Render:** The stroke is rendered immediately on the local canvas (Optimistic UI) to ensure zero latency.
3. **Transmission:** The stroke data (`start {x,y}`, `end {x,y}`, `color`) is emitted to the server.
4. **Broadcast:** The server adds the stroke to the Global History and broadcasts it to all other connected clients.
5. **Remote Render:** Other clients receive the data and render the segment using the same drawing function.

## 4. Key Challenges & Solutions
- **Synchronization:** Used a central "Global History" array on the server. When a new user joins, they receive the full history array to repaint the canvas.
- **Conflict-Free Undo:** The Undo function iterates backwards through the global history and removes only the last action performed by the *requesting User ID*, leaving other users' work intact. Then, a `history_clear_redraw` event triggers a full repaint on all clients.
- **Responsive Design:** Canvas coordinates are normalized relative to the `getBoundingClientRect()` to ensure drawing accuracy regardless of window size or scroll position.

## 5. Directory Structure
- `/server`: Contains the logic for state management and socket events.
- `/client`: Contains the DOM-independent canvas logic (`canvas.js`) and socket listeners (`main.js`).