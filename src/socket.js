/**
 * All socket entry points
 * @param {SocketIO.Server} io 
 */
module.exports = (io) => {
    global.io = io;
    io.on('connection', (socket) => {
        console.log('New device connected');
        require('./modules/jobs/jobs.socket')(socket);
    });
}