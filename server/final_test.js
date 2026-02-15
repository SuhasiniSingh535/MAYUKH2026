const http = require('http');

const server = http.createServer((req, res) => {
    // Headers to allow CORS (Browser access)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    console.log("🔥 REQUEST RECEIVED ON 8888:", req.url);

    if (req.url === '/api/events') {
        res.writeHead(200);
        res.end(JSON.stringify({ 
            status: "SUCCESS", 
            message: "Server 8888 is working perfectly!", 
            events: [] 
        }));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Route not found" }));
    }
});

// Listen on Port 8888
server.listen(8888, () => {
    console.log("✅ NATIVE SERVER STARTED ON PORT 8888");
    console.log("👉 Go to: http://localhost:8888/api/events");
});