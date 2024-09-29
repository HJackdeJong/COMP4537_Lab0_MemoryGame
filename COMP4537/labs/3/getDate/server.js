const http = require('http');  // Use http since Vercel handles HTTPS for you
const locals = require('./locals/en/en.js');  // Adjusted path to match project structure
const { getDate } = require('./modules/utils.js');  // Adjusted path to match project structure

http.createServer(function(req, res) {
    // Construct the URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    console.log(`Received pathname: ${url.pathname}`);

    if (url.pathname === '/getDate') {
        const name = url.searchParams.get('name') || "Guest";
        const currentDate = getDate();
    
        const message = locals.MESSAGES.message
            .replace("%1", name)
            .concat(currentDate);
    
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`<div style="color:blue">${message}</div>`);
    } else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("404 Not Found");
    }

}).listen(process.env.PORT || 3000);

console.log("HTTP server is running");
