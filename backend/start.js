const { spawn } = require('child_process');
const net = require('net');

const PORT = 5001;

// Check if port is already in use
function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(false);
            }
        });

        server.once('listening', () => {
            server.close();
            resolve(true);
        });

        server.listen(port);
    });
}

async function startServer() {
    const isPortAvailable = await checkPort(PORT);

    if (!isPortAvailable) {
        console.log('\n❌ ERROR: Admin Backend already running on port ' + PORT);
        console.log('\n💡 Solution: Use command \'taskkill /F /IM node.exe\' to kill all Node processes');
        console.log('   Then run \'npm start\' again\n');
        process.exit(0);
    }

    // Start the server
    const serverProcess = spawn('node', ['server.js'], {
        stdio: 'inherit',
        shell: true
    });

    serverProcess.on('error', (error) => {
        console.error('Failed to start server:', error);
    });
}

startServer();
