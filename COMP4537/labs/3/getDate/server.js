const http = require('http');
const locals = require('./locals/en/en.js'); // Adjust the path as per your folder structure
const { getDate } = require('./modules/utils.js'); // Adjust the path as per your folder structure

const server = (req, res) => {
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
};

// Instead of `listen`, we export the handler for Vercel
module.exports = server;
