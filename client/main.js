import { CanvasHandler } from './canvas.js';

const socket = io();
const canvasEl = document.getElementById('drawingCanvas');
const canvasHandler = new CanvasHandler(canvasEl);
const colorPicker = document.getElementById('colorPicker');

let isDrawing = false;
let lastPos = { x: 0, y: 0 };
let currentColor = '#000000';
let currentStrokeId = null; 
//Unified Input Handling, Mouse and Touch

//  Normalize coordinates for both Mouse and Touch events
function getPos(e) {
    const rect = canvasEl.getBoundingClientRect();
    
    // Check for touch events
    if (e.touches && e.touches.length > 0) {
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    }
    
    // Fallback to mouse events
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function startDraw(e) {
    if (e.cancelable) e.preventDefault();
    
    isDrawing = true;
    lastPos = getPos(e);
    
    // Generate a unique ID for this specific stroke
    currentStrokeId = Math.random().toString(36).substr(2, 9); 
}

function moveDraw(e) {
    if (e.cancelable) e.preventDefault();
    const currentPos = getPos(e);

    // Cursor move doesn't need strokeId
    socket.emit('cursor_move', { x: currentPos.x, y: currentPos.y, color: currentColor });

    if (!isDrawing) return;

    canvasHandler.drawLine(lastPos, currentPos, { color: currentColor });

    // Send the strokeId to the server
    socket.emit('draw_line', {
        start: lastPos,
        end: currentPos,
        style: { color: currentColor },
        strokeId: currentStrokeId 
    });

    lastPos = currentPos;
}
function endDraw(e) {
    isDrawing = false;
}


// Mouse Events
canvasEl.addEventListener('mousedown', startDraw);
canvasEl.addEventListener('mousemove', moveDraw);
canvasEl.addEventListener('mouseup', endDraw);
canvasEl.addEventListener('mouseout', endDraw); // Stop drawing if mouse leaves canvas

// Touch Events 
canvasEl.addEventListener('touchstart', startDraw, { passive: false });
canvasEl.addEventListener('touchmove', moveDraw, { passive: false });
canvasEl.addEventListener('touchend', endDraw);
canvasEl.addEventListener('touchcancel', endDraw);

// Socket Listeners 

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

// Ghost Cursor Logic
socket.on('cursor_update', (data) => {
    let cursor = document.getElementById(`cursor-${data.id}`);
    
    // Create cursor if it doesn't exist
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = `cursor-${data.id}`;
        cursor.className = 'ghost-cursor';
        const overlay = document.getElementById('ui-overlay') || document.body;
        overlay.appendChild(cursor);
    }
    
    cursor.style.left = `${data.x}px`;
    cursor.style.top = `${data.y}px`;
    cursor.style.backgroundColor = data.color;
});

socket.on('cursor_remove', (id) => {
    const cursor = document.getElementById(`cursor-${id}`);
    if(cursor) cursor.remove();
});



// Undo Button
document.getElementById('undoBtn').addEventListener('click', () => {
    socket.emit('undo');
});

// Color Picker
colorPicker.addEventListener('change', (e) => {
    currentColor = e.target.value;
});