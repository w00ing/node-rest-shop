const http = require("http");
const app = require("./app");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const handleListening = () => {
  console.log(`✅ Listening on http://localhost:${PORT}`);
};

server.listen(PORT, handleListening);
