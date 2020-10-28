const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer();

const handleListening = () => {
  console.log(`✅ Listening on http://localhost:${PORT}`);
};

server.listen(PORT, handleListening);
