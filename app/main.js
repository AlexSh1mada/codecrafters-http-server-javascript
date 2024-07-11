const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
	socket.on("data2", (data2) => {
		const request = data2.toString();
		const path = request.split(" ")[1];
		const content = path.split("/")[2];
		const contentLength = content.length;

		socket.write(
			"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length:" +
				contentLength +
				"\r\n\r\n" +
				content
		);
	});

	socket.on("close", () => {
		socket.end();
	});

});

server.listen(4221, "localhost");
