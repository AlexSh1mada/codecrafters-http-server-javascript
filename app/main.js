const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");


// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();
        const path = request.split(" ")[1]; // path is the 'url'

        if (path === "/") {
            socket.write(`HTTP/1.1 200 OK\r\nContent-Length: 0\r\n\r\n`);
        } else if (path.startsWith("/echo/")) {
            const content = path.substring(6); // Remove '/echo/'
            const contentLength = content.length;
            socket.write("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length:" + 
                contentLength + "\r\n\r\n" + content);
        } else if (path.startsWith('/user-agent')) {
            const header = request.split('\r\n')[2]
            const value = header.substring(0, 11);
            const [ content, version ] = value.split('/') // Removes 'User-Agent:'
            socket.write('HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ' +
                 value.length + "\r\n\r\n" + content + '/' + version)
        } else {
            socket.write(`HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n`);
        }
        socket.end();
    });

    socket.on("close", () => {
        console.log("Connection closed");
    });
});

server.listen(4221, "localhost");
