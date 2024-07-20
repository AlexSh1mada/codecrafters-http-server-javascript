const net = require("net");
const fs = require("fs");
const zlib = require("zlib");
const pathModule = require("path");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");


// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();
        const [requestLine, ...headerLines] = request.split('\r\n');
        const [method, url] = requestLine.split(' ');

        const baseDir = process.argv[2] === '--directory' ? process.argv[3] : '.'

        if( method === 'GET') {
            handleGetRequest(socket, url, baseDir, request)
        } else if (method === 'POST') {
            handlePostRequest(socket, url, baseDir, request)
        } else {
            socket.write('HTTP/1.1 405 Method Not Allowed')
            socket.end()
        }
    });

    function handleGetRequest(socket, url, baseDir, request) {
        if (url === "/") {
            socket.write(`HTTP/1.1 200 OK\r\nContent-Length: 0\r\n\r\n`);
        } else if (url.startsWith("/echo/")) {
            const content = url.substring(6); // Remove '/echo/'
            const contentLength = content.length;
            const lines = request.split('\r\n'); // split response into lines
            let encoding = '';
            for(const line of lines) {
                if (line.startsWith('Accept-Encoding: ')) {
                    encoding = line.substring(17); // Removes 'Accept-Encoding: '
                    break;
                }
            }
            if(encoding.includes('gzip')) {
                zlib.gzip(content, (err, compressedContent) => {
                    if (err) {
                        socket.write('HTTP/1.1 500 Internal Server Error\r\nContent-Length: 0\r\n\r\n');
                    } else {
                        const compressedLength = compressedContent.length;
                        socket.write('HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Encoding: gzip\r\nContent-Length: ' + compressedLength + '\r\n\r\n');
                        socket.write(compressedContent);
                    }
                    socket.end();
                });
            } else {
                socket.write("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length:" + 
                    contentLength + "\r\n\r\n" + content);
                socket.end();
            }


        } else if (url.startsWith('/user-agent')) {
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

        } else if (url.startsWith('/files/')) {
            const filename = url.substring(7) // removes '/files/' from path
            const filepath = pathModule.join(baseDir, filename); //join base directory to filename to get full path using pathmodule for path operations
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
    }

    function handlePostRequest(socket, url, baseDir, request) {
        if (url.startsWith('/files/')) {
            const filename = url.substring(7) //removes '/files/' from path
            const filepath = pathModule.join(baseDir, filename)

            const body = request.split('\r\n\r\n')[1] // Get the body content of the request
            fs.writeFileSync(filepath, body) // Write the body content to the file

            const fileSize = Buffer.byteLength(body) // Get the file size

            socket.write('HTTP/1.1 201 Created\r\n\r\n') 
        }
        socket.end();
    }

    socket.on("close", () => {
        console.log("Connection closed");
    });
});

server.listen(4221, "localhost");
