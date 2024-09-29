const http = require('http');  // Use http since Vercel handles HTTPS for you
const locals = require('./locals/en/en.js');  // Adjusted path to match project structure
const { getDate } = require('./modules/utils.js');  // Adjusted path to match project structure

http.createServer(function(req, res) {
    // Construct the URL
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Check if the request is to /getDate
    if (url.pathname === '/COMP4537/labs/3/getDate') {
        // Get the name from the query parameters
        const name = url.searchParams.get('name') || "Guest";

        // Get the current date and time
        const currentDate = getDate();

        // Construct the message
        const message = locals.MESSAGES.message
            .replace("%1", name)
            .concat(currentDate);

        // Construct the response headers
        res.writeHead(200, { "Content-Type": "text/html" });

        // Send the response in blue text
        res.end(`<div style="color:blue">${message}</div>`);
    } else {
        // Handle 404 for other routes
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("404 Not Found");
    }

}).listen(process.env.PORT || 3000);

console.log("HTTP server is running");
