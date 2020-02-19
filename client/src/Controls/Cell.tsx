import React, {memo, HTMLAttributes} from 'react'
import 'Controls/Cell/Cell.less'
import ICellConfig from 'Interfaces/ICellConfig'

export default memo(({withShip = false, isAttacked = false, ...other}: ICellConfig & HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={`Controls-Cell Controls-Cell-style_${getStyle(withShip, isAttacked)}`} {...other}></div>
    )
})

function getStyle(withShip: boolean, isAttacked: boolean): string {
    let style: string =  withShip ?  'ship' : 'empty';

    if (isAttacked) {
        style += 'Attacked';
    }

    return style;
}
