const socketIO = require('socket.io');
const { ExpenseMessage, User } = require('../models');

let io;

const initSocket = (httpServer) => {
  io = socketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Client joins an expense room
    socket.on('join_expense', (expenseId) => {
      socket.join(`expense_${expenseId}`);
      console.log(`Socket ${socket.id} joined expense_${expenseId}`);
    });

    // Client sends a message
    socket.on('send_message', async (data) => {
      const { expense_id, message, user_id } = data;
      try {
        const newMsg = await ExpenseMessage.create({
          expense_id,
          user_id,
          message,
        });

        const msgWithUser = await ExpenseMessage.findByPk(newMsg.id, {
          include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email'] }],
        });

        io.to(`expense_${expense_id}`).emit('receive_message', msgWithUser);
      } catch (err) {
        console.error('Socket message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
