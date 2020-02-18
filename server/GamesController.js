const qs = require('querystring');
const url = require('url');
const crypto = require('crypto');

const EventStream = require('./EventStream');
const Game = require('./Game');
const validateLocationShips = require('../client/build/validateLocationShips').default;

module.exports = class GamesController {
    _hashGames = {};
    _configPlayerWaitingForGame = {};

    connectPlayer(request, response) {
        const idPlayer = this._getIdPlayer(request);
        const currentGame = this._hashGames[idPlayer];
        const params = qs.parse(url.parse(request.url).query);
        const eventStream = new EventStream(response);

        if (currentGame) {
            currentGame.reconnectPlayer(idPlayer, eventStream);
        } else if (idPlayer) {
            // No active game
            eventStream.close( {
                'Set-Cookie': "id-player=; max-age=0"
            });
        } else {
            let locationOfShips;

            try {
                locationOfShips = JSON.parse(params.locationOfShips);
            } catch (e) {
                // Bad data location of ships
                eventStream.close();
                return;
            }

            if (validateLocationShips(locationOfShips).allPlaced) {
                const tomorrow = new Date();
                const newIdPlayer = this._generateIdPlayer();
                const configPlayer = {
                    idPlayer: newIdPlayer,
                    locationOfShips: locationOfShips,
                    eventStream: eventStream
                };

                tomorrow.setDate(tomorrow.getDate() + 1);
                response.on('close', () => this._lostConnectionHandler(newIdPlayer));
                response.writeHead(200, {
                    'Content-Type': 'text/event-stream; charset=utf-8',
                    'Cache-Control': 'no-cache',
                    'Set-Cookie': `id-player=${newIdPlayer}; path=/; expires=${tomorrow.toUTCString()}`
                });

                if (this._configPlayerWaitingForGame.idPlayer) {
                    const newGame = new Game([this._configPlayerWaitingForGame, configPlayer], (configsPlayers) => {
                        configsPlayers.forEach((config) => {
                            delete this._hashGames[config.idPlayer];
                        });
                    });

                    this._hashGames[newIdPlayer] = newGame;
                    this._hashGames[this._configPlayerWaitingForGame.idPlayer] = newGame;
                    this._configPlayerWaitingForGame = {};
                } else {
                    this._configPlayerWaitingForGame = configPlayer;
                }
            } else {
                // Invalid location of ships
                eventStream.close();
            }
        }
    }

    notifyEvent(request, response) {
        const params = qs.parse(url.parse(request.url).query);
        const idPlayer = this._getIdPlayer((request));
        const currentGame = this._hashGames[idPlayer];

        switch (params.event) {
            case 'fire':
                if (currentGame) {
                    response.end(JSON.stringify(currentGame.fire(idPlayer, params)));
                } else {
                    response.end(JSON.stringify('You do not have an active game'));
                }
                break;

            default:
                response.end(JSON.stringify('Incorrect event'));
        }
    }

    _getIdPlayer(request) {
        const cookie = request.headers['cookie'] || '';

        return (cookie.match(/id-player=([a-z0-9]*)/) || [])[1];
    }

    _generateIdPlayer() {
        return crypto.randomBytes(16).toString("hex");
    }

    _lostConnectionHandler(idPlayer) {
        const currentGame = this._hashGames[idPlayer];

        if (currentGame) {
            currentGame.disconnectPlayer(idPlayer);
        } else if (this._configPlayerWaitingForGame.idPlayer === idPlayer) {
            this._configPlayerWaitingForGame = {};
        }
    }
};
