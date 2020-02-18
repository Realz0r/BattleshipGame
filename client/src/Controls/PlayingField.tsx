import React, {Component} from 'react';
import Board, {mapType} from 'Controls/Board';
import Button  from 'Controls/Button';
import {show as showInfoBox}  from 'Controls/InfoBox';
import 'Controls/PlayingField/PlayingField.less';
import validateLocationShips, {IResultValidate} from 'validateLocationShips';

import {ComponentProps as ComponentPropsCell} from 'Controls/Cell';

interface ComponentProps {
    onClick: Function
    startGameCallback: Function
}

interface ComponentStates {
    placementIsFull: boolean
    stageOfPlacement: boolean,
    isYourMove: boolean
    yourMap: mapType
    enemyMap: mapType
    caption?: string
}

export default class PlayingField extends Component {
    state: ComponentStates;
    props: ComponentProps;

    constructor() {
        super(...arguments);

        this.state = {
            placementIsFull: false,
            stageOfPlacement: true,
            yourMap: this._getClearMap(),
            enemyMap: this._getClearMap(),
            isYourMove: null
        };

        this._yourMapClickHandler = this._yourMapClickHandler.bind(this);
        this._enemyMapClickHandler = this._enemyMapClickHandler.bind(this);
    }

    render() {
        let caption: string;
        let needShowStartGame: boolean = false;

        if (this.state.caption) {
            caption = this.state.caption;
        } else if (!this.state.placementIsFull) {
            caption = 'Расставьте ваши корабли, ваше поле слева';
        } else if (this.state.stageOfPlacement) {
            needShowStartGame = true;
            caption = 'Ваши корабли расставлены, нажмите кнопку';
        } else if (this.state.isYourMove === null) {
            caption = 'В поиске противника ожидайте';
        } else {
            caption = 'Сейчас ' + (this.state.isYourMove ? 'Ваш ход' : 'ход опоннента');
        }

        return (
            <div className="Controls-GameField">
                <div className="Controls-GameField-header">
                    {caption}
                    {needShowStartGame && <Button className="Controls-GameField-startGameButton" onClick={() => this._startGameClickHandler()}>Начать игру</Button>}
                </div>

                <div className="Controls-GameField-body">
                    <div className="Controls-GameField-wrapperBoard">
                        <Board map={this.state.yourMap} onClick={this._yourMapClickHandler}/>
                    </div>
                    <div className="Controls-GameField-wrapperBoard">
                        <Board map={this.state.enemyMap} onClick={this._enemyMapClickHandler}/>
                    </div>
                </div>
            </div>
        );
    }

    enemyFire(indexRow: number, indexCell: number): void {
        const newYourMap: mapType = this.state.yourMap.slice();
        const cellConfig: ComponentPropsCell  = newYourMap[indexRow][indexCell];

        if (!cellConfig.isAttacked) {
            cellConfig.isAttacked = true;
            this.setState({yourMap: newYourMap, isYourMove: !cellConfig.withShip});
        }
    }

    endGame(params): void {
        this.setState({
            caption: 'Игра окончена, вы ' + (params.isYouWin ? 'победили': 'проиграли'),
            ...params
        })
    }

    protected _yourMapClickHandler(indexRow: number, indexCell: number, cellValue: string): void {
        if (this.state.stageOfPlacement) {
            let resValidateMap: IResultValidate;
            let newYourMap = this.state.yourMap.slice();
            let cellConfig = newYourMap[indexRow][indexCell];

            cellConfig.withShip = !cellConfig.withShip;
            resValidateMap = validateLocationShips(newYourMap);

            if (resValidateMap.isValidate) {
                this.setState({
                    yourMap: newYourMap,
                    placementIsFull: resValidateMap.allPlaced
                });
            } else {
                cellConfig.withShip = !cellConfig.withShip;
            }
        }
    }

    protected _enemyMapClickHandler(indexRow: number, indexCell: number, cellValue: string, event: SyntheticEvent): void {
        if (!this.state.stageOfPlacement && this.state.isYourMove && !this.state.enemyMap[indexRow][indexCell].isAttacked) {
            const targetEvent = event.target;

            this.state.isYourMove = null;
            this.props.onClick(...arguments).then(({withShip, shipIsWasDestroyed}) => {
                let newEnemyMap = this.state.enemyMap.slice();

                newEnemyMap[indexRow][indexCell] = {
                    withShip: withShip,
                    isAttacked: true
                };

                this.setState({
                    enemyMap: newEnemyMap,
                    isYourMove: withShip
                });

                if (shipIsWasDestroyed) {
                    showInfoBox('Убил', targetEvent, 1500);
                }
            }, () => {
                this.state.isYourMove = true;
            });
        }
    }

    protected _startGameClickHandler() {
        this.props.startGameCallback(this.state.yourMap);
        this.setState({
            stageOfPlacement: false,
            placementIsFull: true
        });
    }

    private _getClearMap(sizeBoard: number = 10): mapType {
        return new Array(sizeBoard).fill(null).map(() => {
            return new Array(sizeBoard).fill(null).map(() => {
                return {};
            });
        });
    }
}
