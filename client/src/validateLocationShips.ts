import ICellConfig from 'Interfaces/ICellConfig'

export interface IResultValidate {
    isValidate: boolean,
    allPlaced: boolean
}

export default function(locationOfShips: Array<Array<ICellConfig>>): IResultValidate {
    let isValidate: boolean = true;
    let ships: number[] = new Array(5).fill(0);

    try {
        locationOfShips.forEach((row: ICellConfig[], indexRow: number) => {
            let lengthFoundShip: number = 0;

            row.forEach((cellConfig: ICellConfig, indexCell: number) => {
                if (cellConfig.withShip) {
                    const downRow: ICellConfig[] = locationOfShips[indexRow + 1];
                    const upRow: ICellConfig[] = locationOfShips[indexRow - 1];
                    const topCellWithoutShip: boolean = !upRow || !upRow[indexCell].withShip;
                    const bottomCellWithShip: boolean = downRow && downRow[indexCell].withShip;

                    // Проверка на пересечение по диагонали
                    if (downRow && downRow[indexCell + 1] && downRow[indexCell + 1].withShip ||
                        upRow && upRow[indexCell + 1] && upRow[indexCell + 1].withShip) {
                        isValidate = false;
                    }

                    if (bottomCellWithShip) {
                        if (topCellWithoutShip) {
                            // Найдем длину корабля по вертикали
                            let currentIndexRow: number = indexRow + 2;

                            while (locationOfShips[currentIndexRow] && locationOfShips[currentIndexRow][indexCell] &&
                            locationOfShips[currentIndexRow][indexCell].withShip) {
                                currentIndexRow++;
                            }

                            ships[currentIndexRow - indexRow]++;
                        }
                    } else if (topCellWithoutShip) {
                        lengthFoundShip++;
                    }
                } else if (lengthFoundShip > 0) {
                    ships[lengthFoundShip]++;
                    lengthFoundShip = 0;
                }
            });

            if (lengthFoundShip > 0) {
                ships[lengthFoundShip]++;
            }
        });
    } catch(e) {
        isValidate = false;
    }

    if (isValidate && (ships.length > 5 || ships[4] > 1 || ships[4] + ships[3] > 3 ||
        ships[4] + ships[3] + ships[2] > 6 || ships[4] + ships[3] + ships[2] + ships[1] > 10)) {

        isValidate = false;
    }

    return {
        isValidate: isValidate,
        allPlaced: isValidate && ships[1] === 4 && ships[2] === 3 && ships[3] === 2 && ships[4] === 1
    };
};
