const { AsyncLocalStorage } = require('node:async_hooks');

const abortableRequestContext = new AsyncLocalStorage();

module.exports = abortableRequestContext;
