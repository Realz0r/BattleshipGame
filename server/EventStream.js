const util = require('util');

module.exports = class EventStream {
    response = null;
    _isClosed = false;

    constructor(response) {
        this.response = response;

        response.on('close', () => this._isClosed = true);
        response.writeHead(200, {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache'
        });
    }

    write(eventName, params) {
        if (!this._isClosed) {
            const data = JSON.stringify(params);
            const message = util.format('event: %s\ndata: %s\n\n', eventName, data);

            this.response.write(message);
        }
    }

    close(headers) {
        if (!this._isClosed) {
            this.response.writeHead(204, {
                'Content-Type': 'text/plain; charset=utf-8',
                ...headers
            });
            this.response.end();
        }
    }
};