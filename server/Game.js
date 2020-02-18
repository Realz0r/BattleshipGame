const util = require('util');

const TIME_FOR_RECONNECT = 1000 * 120;
const ERROR_MESSAGE_AT_DOUBLE_CONNECTION = 'Создано новое соединение с игрой,' +
    ' если вы хотите продолжить игру на этой вкладке, перезагрузите страницу';

module.exports = class GameBattleShip {
    _disconnects = {};
    _whoseMove = 0;
    _playersConfigs = [];
    _engGameCallback;

    constructor(playersConfigs, engGameCallback) {
        this._playersConfigs = playersConfigs;
        this._whoseMove = Math.random() > 0.5 ? 0 : 1;
        this._engGameCallback = engGameCallback;
        this._startGame();
    }

    disconnectPlayer(idPlayer) {
        this._disconnects[idPlayer] = setTimeout(() => {
            const otherPlayerConfig = this._playersConfigs.filter((config) => {
                return config.idPlayer !== idPlayer;
            })[0];

            this._endGame(otherPlayerConfig.idPlayer);
        }, TIME_FOR_RECONNECT);
    }

    reconnectPlayer(idPlayer, newEventStream) {
        const playerConfig = this._getConfigById(idPlayer);

        if (playerConfig) {
            const oldEventStream = playerConfig.eventStream;
            const otherPlayerConfig = this._playersConfigs[0] === playerConfig ? this._playersConfigs[1] : this._playersConfigs[0];
            const enemyMap = otherPlayerConfig.locationOfShips.map(row => {
                return row.map(cellConfig => {
                    return {
                        isAttacked: cellConfig.isAttacked,
                        withShip: cellConfig.isAttacked && cellConfig.withShip
                    }
                });
            });

            clearTimeout(this._disconnects[idPlayer]);
            delete this._disconnects[idPlayer];
            newEventStream.write('updateStates', {
                yourMap: playerConfig.locationOfShips,
                enemyMap: enemyMap,
                isYourMove: this._playersConfigs[this._whoseMove] === playerConfig
            });
            oldEventStream.write('errorConnection', {text: ERROR_MESSAGE_AT_DOUBLE_CONNECTION}, undefined, () => {
                oldEventStream.close();
            });
            playerConfig.eventStream = newEventStream;
        }
    }

    fire(idPlayer, {row, cell}) {
        if (this._playersConfigs[this._whoseMove].idPlayer !== idPlayer) {
            return 'Now the opponent’s move';
        }

        const configOtherPlayer = this._playersConfigs[(this._whoseMove + 1) % 2];
        const locationOfShipsOtherPlayer = configOtherPlayer.locationOfShips;
        const cellConfig = locationOfShipsOtherPlayer[row][cell];

        cellConfig.isAttacked = true;
        configOtherPlayer.eventStream.write('enemyFire', {row: row, cell: cell});

        if (cellConfig.withShip) {
            let withNotDestroyedShip = false;

            locationOfShipsOtherPlayer.forEach((row) => {
                row.forEach((cellConfig) => {
                    withNotDestroyedShip = withNotDestroyedShip || cellConfig.withShip && !cellConfig.isAttacked;
                });
            });

            if (!withNotDestroyedShip) {
                this._endGame(idPlayer);
            }

        } else {
            this._whoseMove = (this._whoseMove + 1) % 2;
        }

        return {
            withShip: !!cellConfig.withShip,
            shipIsWasDestroyed: !!cellConfig.withShip && this._shipIsWasDestroyed(+row, +cell)
        };
    }

    _getConfigById(id) {
       return this._playersConfigs.filter((config) => {
           return config.idPlayer === id;
       })[0];
    }

    _startGame() {
        this._playersConfigs.forEach((config, index) => {
            config.eventStream.write('gameStarted', {isYourMove: index === this._whoseMove});
        });
    }

    _endGame(idWinner) {
        this._playersConfigs.forEach((config, index) => {
            config.eventStream.write('gameEnded', {
                isYouWin: config.idPlayer === idWinner,
                enemyMap: this._playersConfigs[index ? 0 : 1].locationOfShips
            }, undefined, () => {
                config.eventStream.close();
            });
        });

        if (this._engGameCallback instanceof Function) {
            this._engGameCallback(this._playersConfigs);
        }
    }

    _shipIsWasDestroyed(row, cell) {
        let shipIsWasDestroyed = true;
        const locationOfShips = this._playersConfigs[(this._whoseMove + 1) % 2].locationOfShips;

        for (let currentRow = row - 1; locationOfShips[currentRow] && locationOfShips[currentRow][cell].withShip; currentRow--) {
            if (!locationOfShips[currentRow][cell].isAttacked) {
                shipIsWasDestroyed = false;
            }
        }

        for (let currentRow = row + 1; locationOfShips[currentRow] && locationOfShips[currentRow][cell].withShip; currentRow++) {
            if (!locationOfShips[currentRow][cell].isAttacked) {
                shipIsWasDestroyed = false;
            }
        }

        for (let currentCell = cell - 1; locationOfShips[row][currentCell] && locationOfShips[row][currentCell].withShip; currentCell--) {
            if (!locationOfShips[row][currentCell].isAttacked) {
                shipIsWasDestroyed = false;
            }
        }

        for (let currentCell = cell + 1; locationOfShips[row][currentCell] && locationOfShips[row][currentCell].withShip; currentCell++) {
            if (!locationOfShips[row][currentCell].isAttacked) {
                shipIsWasDestroyed = false;
            }
        }

        return shipIsWasDestroyed;
    }
};
