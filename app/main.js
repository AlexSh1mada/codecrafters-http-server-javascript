const net = require("net");
const fs = require("fs");
const pathModule = require("path");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");


// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();
        const path = request.split(" ")[1]; // path is the 'url'

        //const baseDir = process.argv[2] === '--directory' ? process.argv[3] : '.'

        if (path === "/") {
            socket.write(`HTTP/1.1 200 OK\r\nContent-Length: 0\r\n\r\n`);
        } else if (path.startsWith("/echo/")) {
            const content = path.substring(6); // Remove '/echo/'
            const contentLength = content.length;

            socket.write("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length:" + 
                contentLength + "\r\n\r\n" + content);

        } else if (path.startsWith('/user-agent')) {
            const lines = request.split('\r\n'); // split response into lines
            let userAgent = "";
            for (const line of lines) { 
                if (line.startsWith("User-Agent: ")) { // Compare if the line starts with 'User-Agent: '
                    userAgent = line.substring(12); // Remove 'User-Agent: '
                    break;
                }
            }
            const contentLength = userAgent.length;
            socket.write("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: " +
                 contentLength + "\r\n\r\n" + userAgent);

        } else if (path.startsWith('/files/')) {
            const directory = process.argv[3];
            const filename = path.substring(7) // removes '/files/' from path
            const filepath = pathModule.join(directory, filename); //join base directory to filename to get full path using pathmodule for path operations
            const contentType = 'application/octet-stream'

            if (fs.existsSync(filepath)) { // Checks if file exists
                const fileContent = fs.readFileSync(filepath) // Read file content
                const fileSize = fileContent.length; //Get file size

                socket.write(`HTTP/1.1 200 OK\r\nContent-Type: ${contentType}\r\nContent-Length: ${fileSize}\r\n\r\n`)
                socket.write(fileContent) // Write file content response
            } else {
                socket.write(`HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n`);
            }
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
