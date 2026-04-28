const socketIo = require('socket.io');
const MongoMessage = require('../models/MongoMessage');
const MongoConversation = require('../models/MongoConversation');

let io;

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });

        socket.on('send_message', async (data) => {
            const { conversationId, senderId, text } = data;
            
            try {
                // Broadcast to the room
                io.to(conversationId).emit('receive_message', {
                    id: Date.now(), // Temporary ID until saved
                    conversationId,
                    senderId,
                    text,
                    createdAt: new Date()
                });

                // The actual saving is still handled by the REST API for now to maintain consistency,
                // or we could do it here. Let's stick to REST for saving for now to avoid duplicate logic,
                // but use Socket for instant UI updates.
            } catch (error) {
                console.error('Socket Message Error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIo };
