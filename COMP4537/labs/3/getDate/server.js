const http = require('http');  
const fs = require('fs');
const path = require('path');
const locals = require('./locals/en/en.js');  // Adjusted path to match project structure
const { getDate } = require('./modules/utils.js');  // Adjusted path to match project structure

// Function to serve static files from a given directory
function serveStaticFiles(filePath, res) {
    const fullPath = path.join(__dirname, filePath);

    fs.readFile(fullPath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { "Content-Type": "text/html" });
                res.end("404 Not Found");
            } else {
                res.writeHead(500, { "Content-Type": "text/html" });
                res.end("500 Internal Server Error");
            }
        } else {
            let ext = path.extname(fullPath).toLowerCase();
            let contentType = 'text/html';  // Default content type

            // Set appropriate content type for different file extensions
            const mimeTypes = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
            };

            if (mimeTypes[ext]) {
                contentType = mimeTypes[ext];
            }

            res.writeHead(200, { "Content-Type": contentType });
            res.end(data);
        }
    });
}

// Create the HTTP server
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
    } else if (url.pathname === '/') {
        // Serve index.html or other static files when the path is '/'
        serveStaticFiles('/index.html', res);
    } else {
        // Attempt to serve any static file requested
        serveStaticFiles(url.pathname, res);
    }

}).listen(process.env.PORT || 3000);

console.log("HTTP server is running");
