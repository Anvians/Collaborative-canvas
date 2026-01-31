import { CanvasHandler } from './canvas.js';

const socket = io();
const canvasEl = document.getElementById('drawingCanvas');
const canvasHandler = new CanvasHandler(canvasEl);

// UI Elements
const colorPicker = document.getElementById('colorPicker');
const widthPicker = document.getElementById('widthPicker');
const brushBtn = document.getElementById('brushBtn');
const eraserBtn = document.getElementById('eraserBtn');
const undoBtn = document.getElementById('undoBtn');
const clearBtn = document.getElementById('clearBtn');
const userListEl = document.getElementById('userList');

let isDrawing = false;
let currentMode = 'brush'; // 'brush' or 'eraser'
let currentColor = '#000000';
let currentWidth = 5; // Default width
let lastPos = { x: 0, y: 0 };
let currentStrokeId = null;


brushBtn.addEventListener('click', () => {
    currentMode = 'brush';
    brushBtn.classList.add('active');
    eraserBtn.classList.remove('active');
});

eraserBtn.addEventListener('click', () => {
    currentMode = 'eraser';
    eraserBtn.classList.add('active');
    brushBtn.classList.remove('active');
});

widthPicker.addEventListener('input', (e) => {
    currentWidth = parseInt(e.target.value, 10);
});

colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
});

undoBtn.addEventListener('click', () => {
    socket.emit('undo');
});

clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the entire board?')) {
        socket.emit('clear_all');
    }
});

// Input Logic (Mouse & Touch)

function getPos(e) {
    const rect = canvasEl.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Scale logic for high DPI screens if needed, usually this is enough:
    return { 
        x: clientX - rect.left, 
        y: clientY - rect.top 
    };
}

function startDraw(e) {
    if (e.cancelable) e.preventDefault();
    isDrawing = true;
    lastPos = getPos(e);
    // Generate unique ID for this stroke
    currentStrokeId = Math.random().toString(36).substr(2, 9);
}

function moveDraw(e) {
    if (e.cancelable) e.preventDefault();
    const currentPos = getPos(e);

    // Determine actual color (Eraser = White)
    const drawColor = currentMode === 'eraser' ? '#FFFFFF' : currentColor;
    const drawWidth = currentWidth; 

    // Emit Cursor Move
    socket.emit('cursor_move', { 
        x: currentPos.x, 
        y: currentPos.y, 
        color: drawColor 
    });

    if (!isDrawing) return;

    // Draw Locally
    canvasHandler.drawLine(lastPos, currentPos, { 
        color: drawColor, 
        width: drawWidth // Use the dynamic width
    });

    // Emit Draw Event
    socket.emit('draw_line', {
        start: lastPos,
        end: currentPos,
        style: { 
            color: drawColor, 
            width: drawWidth // Send dynamic width to server
        },
        strokeId: currentStrokeId
    });

    lastPos = currentPos;
}

function endDraw() {
    isDrawing = false;
}

// Attach Listeners
canvasEl.addEventListener('mousedown', startDraw);
canvasEl.addEventListener('mousemove', moveDraw);
canvasEl.addEventListener('mouseup', endDraw);
canvasEl.addEventListener('mouseout', endDraw); // Stop if mouse leaves area

canvasEl.addEventListener('touchstart', startDraw, { passive: false });
canvasEl.addEventListener('touchmove', moveDraw, { passive: false });
canvasEl.addEventListener('touchend', endDraw);


socket.on('draw_line', (data) => {
    canvasHandler.drawLine(data.start, data.end, data.style);
});

socket.on('history_sync', (history) => {
    history.forEach(step => canvasHandler.drawLine(step.start, step.end, step.style));
});

socket.on('history_clear_redraw', (history) => {
    canvasHandler.clear();
    history.forEach(step => canvasHandler.drawLine(step.start, step.end, step.style));
});

// User Management
socket.on('update_users', (users) => {
    userListEl.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="user-dot" style="background:${user.color}"></span> User ${user.id.substr(0,4)}`;
        userListEl.appendChild(li);
    });
});

// Ghost Cursor
socket.on('cursor_update', (data) => {
    let cursor = document.getElementById(`cursor-${data.id}`);
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = `cursor-${data.id}`;
        cursor.className = 'ghost-cursor';
        document.body.appendChild(cursor);
    }
    cursor.style.left = `${data.x}px`;
    cursor.style.top = `${data.y}px`;
    cursor.style.backgroundColor = data.color;
});

socket.on('cursor_remove', (id) => {
    const el = document.getElementById(`cursor-${id}`);
    if (el) el.remove();
});