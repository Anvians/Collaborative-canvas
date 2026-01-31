const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { addStroke, getHistory, undoLastAction, clearHistory } = require('./stateManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, '../client')));

// Track connected users
let users = [];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Add new user
    const newUser = { 
        id: socket.id, 
        color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
    };
    users.push(newUser);

    //  Broadcast Updates
    io.emit('update_users', users);
    socket.emit('history_sync', getHistory());

    //  Handle Drawing
    socket.on('draw_line', (data) => {
        addStroke({ ...data, userId: socket.id }); // Add to history
        socket.broadcast.emit('draw_line', data); // Send to others
    });

    //  Handle Global Undo
    socket.on('undo', () => {
        const changed = undoLastAction(); 
        if (changed) {
            io.emit('history_clear_redraw', getHistory());
        }
    });

    socket.on('clear_all', () => {
        clearHistory(); 
        io.emit('history_clear_redraw', []); // Send empty history to everyone
    });

    //  Cursor Movement
    socket.on('cursor_move', (data) => {
        socket.broadcast.emit('cursor_update', { id: socket.id, ...data });
    });

    //  Disconnect
    socket.on('disconnect', () => {
        users = users.filter(u => u.id !== socket.id);
        io.emit('update_users', users);
        io.emit('cursor_remove', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});