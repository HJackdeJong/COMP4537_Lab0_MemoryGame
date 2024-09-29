const http = require('http');  // Use http since Vercel handles HTTPS for you
const locals = require('/COMP4537/labs/3/locals/en/en.js');
const { getDate } = require('COMP4537/labs/3/modules/utils.js');

http.createServer(function(req, res) {
    // Construct the URL
    const url = new URL(req.url, `http://${req.headers.host}`);

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

}).listen(process.env.PORT);

console.log("HTTP server is running");
