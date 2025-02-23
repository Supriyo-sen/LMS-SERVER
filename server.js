const http = require("http");
const app = require("./app");
const { initSocket } = require("./src/config/socket");

const server = http.createServer(app);
const io = initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
