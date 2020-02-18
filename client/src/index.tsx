import React from 'react';
import {render} from 'react-dom';
import {createEventSource, sendEvent} from './Source';
import PlayingField from 'Controls/PlayingField';

const root: HTMLElement = document.getElementById('root');
const gameField: PlayingField = render(
    <PlayingField onClick={(indexRow, indexCell) => sendEvent('fire', {row: indexRow, cell: indexCell})}
                  startGameCallback={openEventStream}/>, root
);

if (document.cookie.indexOf('id-player') !== -1) {
    // Если будет незавершенная активная игра, то сервер пришлет все необходимые события, иначе закроет соединение
    openEventStream();
}

function openEventStream(locationOfShips = null): void {
    const paramsUrl = {locationOfShips: JSON.stringify(locationOfShips)};
    const listEvents: string[] = ['gameStarted', 'enemyFire', 'updateStates', 'errorConnection', 'gameEnded'];

    createEventSource(paramsUrl, listEvents, (eventName, params) => {
        switch (eventName) {
            case 'gameStarted':
                gameField.setState(params);
                break;

            case 'enemyFire':
                gameField.enemyFire(params.row, params.cell);
                break;

            case 'errorConnection':
                render(<h1>{params.text}</h1>, root);
                break;

            case 'updateStates':
                gameField.setState({
                    placementIsFull: true,
                    stageOfPlacement: false,
                    ...params
                });
                break;

            case 'gameEnded':
                gameField.endGame(params);
                break;
        }
    });
}
