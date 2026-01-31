#  Real-Time Collaborative Drawing Canvas

A full-stack, real-time drawing application where multiple users can draw simultaneously on a shared canvas. Built to demonstrate mastery of **WebSockets**, **HTML5 Canvas API**, and **Distributed State Management**.

##  Features

* **Real-Time Collaboration:** Instant drawing synchronization across multiple clients using Socket.io.
* **Ghost Cursors:** See exactly where other users are hovering/drawing in real-time.
* **Global History & Undo:** * Implements a robust "Stroke ID" system.
    * "Undo" removes only the specific user's last complete stroke without affecting others' work.
* **Device Support:**
    *  **Desktop:** Mouse events.
    *  **Touch:** Full mobile/tablet support with `preventDefault` to block scrolling while drawing.
* **Optimistic UI:** Local drawing renders immediately for zero-latency feel, while background synchronization handles the network.
* **Responsive Canvas:** Automatically adjusts to window size and high-DPI screens.

##  Tech Stack

* **Runtime:** Node.js (v18+)
* **Backend:** Express.js, Socket.io
* **Frontend:** Vanilla JavaScript (ES6+), HTML5 Canvas API
* **Styling:** CSS3
* **No External Drawing Libraries:** All logic uses native `getContext('2d')`.

##  Installation & Setup

1.  **Clone the repository** (or unzip the folder):
    ```bash
    git clone <repository-url>
    cd collaborative-canvas
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Start the Server:**
    ```bash
    node server/server.js
    ```

4.  **Run the Application:**
    Open your browser and navigate to:
    `http://localhost:3000`

##  How to Test (Evaluation Guide)

To verify the features required by the assignment:

### 1. Real-Time Sync
* Open the app in two separate browser windows (or an Incognito tab).
* Draw in Window A; observe the line appearing instantly in Window B.

### 2. Ghost Cursors
* Move your mouse in Window A without clicking.
* Observe the labeled cursor moving in Window B.

### 3. Conflict-Free Undo
* **Window A:** Draw a **Blue** circle.
* **Window B:** Draw a **Red** square.
* **Window A:** Click "Undo".
* **Result:** Only the **Blue** circle disappears. The Red square remains untouched.

### 4. Mobile Support
* Find your computer's local IP (e.g., `192.168.x.x`).
* Open `http://YOUR_IP:3000` on your phone connected to the same WiFi.
* Draw with your finger.

##  Project Structure

```text
collaborative-canvas/
├── client/
│   ├── index.html       # UI Entry point
│   ├── style.css        # Styling for canvas and ghost cursors
│   ├── canvas.js        # Pure drawing logic & coordinate mapping
│   ├── main.js          # Socket listeners, Input handling (Mouse/Touch)
├── server/
│   ├── server.js        # Express server & Socket.io setup
│   ├── state-manager.js # History stack & Undo logic (Stroke ID filtering)
├── package.json
├── ARCHITECTURE.md      # Technical explanation of data flow
└── README.md