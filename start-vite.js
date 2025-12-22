const { spawn } = require('child_process');
const net = require('net');

const PORT = 5000;

function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') resolve(false);
            else resolve(true);
        });
        server.once('listening', () => {
            server.close();
            resolve(true);
        });
        server.listen(port);
    });
}

async function startVite() {
    let isPortAvailable = await checkPort(PORT);

    // Double check specific ipv4 just to be safe
    if (isPortAvailable) {
        isPortAvailable = await new Promise(resolve => {
            const server = net.createServer();
            server.once('error', () => resolve(false));
            server.once('listening', () => { server.close(); resolve(true); });
            server.listen(PORT, '127.0.0.1');
        });
    }

    if (!isPortAvailable) {
        console.log('\n❌ ERROR: Admin Frontend already running on port ' + PORT);
        console.log('\n💡 Solution: Use command \'taskkill /F /IM node.exe\' to kill all Node processes');
        console.log('   Then run \'npm start\' again\n');
        process.exit(0);
    }

    // Start Vite
    const viteProcess = spawn('vite', [], {
        stdio: 'inherit',
        shell: true
    });

    viteProcess.on('error', (error) => {
        console.error('Failed to start Vite:', error);
    });
}

startVite();
