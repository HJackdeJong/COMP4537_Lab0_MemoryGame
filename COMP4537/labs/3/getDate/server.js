const http = require('http');
const path = require('path');
const fs = require('fs');

// Importing the locals and the getDate function from your modules
const locals = require('./locals/en/en.js');
const { getDate } = require('./modules/utils.js');

// Create the HTTP server
http.createServer(function(req, res) {
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

}).listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
