// List all routes in the Express app
const express = require('express');
const app = express();
const routes = require('./src/routes').default;

// Mount the routes the same way they're mounted in the app
app.use('/api', routes);

// Function to print routes
function print(path, layer) {
    if (layer.route) {
        layer.route.stack.forEach(print.bind(null, path.concat(layer.route.path)));
    } else if (layer.name === 'router' && layer.handle.stack) {
        layer.handle.stack.forEach(print.bind(null, path.concat(layer.regexp.source.replace(/\\\//g, '/').replace('^\\/', '').replace('\\/?(?=\\/|$)', ''))));
    } else if (layer.method) {
        console.log('%s %s', layer.method.toUpperCase(), path.concat(layer.regexp.source.replace(/\\\//g, '/').replace('^\\/', '').replace('\\/?(?=\\/|$)', '')).filter(Boolean).join('/'));
    }
}

// Print all routes
console.log('\nAPI Routes:');
app._router.stack.forEach(print.bind(null, []));