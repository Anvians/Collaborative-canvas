const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { addStroke, getHistory, undoLastUserAction } = require('./stateManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve client files
app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    //  Send existing drawing history to the new user
    socket.emit('history_sync', getHistory());

    //  Listen for drawing actions
    socket.on('draw_line', (data) => {
        // Store the action with the user's ID
        const action = { ...data, userId: socket.id };
        addStroke(action);
        
        // Broadcast to everyone else
        socket.broadcast.emit('draw_line', action);
    });

    //  Handle Undo
    socket.on('undo', () => {
        const hasChanged = undoLastUserAction(socket.id);
        if (hasChanged) {
            // If history changed, everyone needs to redraw
            io.emit('history_clear_redraw', getHistory());
        }
    });

    //  Ghost Cursor Movement
    socket.on('cursor_move', (data) => {
        socket.broadcast.emit('cursor_update', {
            id: socket.id,
            x: data.x,
            y: data.y,
            color: data.color
        });
    });

    socket.on('disconnect', () => {
        io.emit('cursor_remove', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});