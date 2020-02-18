import React, {memo} from 'react'
import 'Controls/Cell/Cell.less'

export interface ComponentProps {
    withShip?: boolean
    isAttacked?: boolean
}

export default memo(({withShip = false, isAttacked = false, ...other}: ComponentProps) => {
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
