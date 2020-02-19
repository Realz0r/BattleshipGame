import React, {memo, HTMLAttributes, MouseEvent} from 'react'
import Cell from 'Controls/Cell'
import ICellConfig from 'Interfaces/ICellConfig'
import 'Controls/Board/Board.less'

export type mapType = Array<Array<ICellConfig>>
export interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
    map: mapType
}

function renderRow(onClick: Function|undefined, cells: string[], indexRow: number) {
   return (
       <div className="Controls-Board_row" key={indexRow}>
          {cells.map((cellValue: string, indexCell: number) => {
              return <Cell key={indexCell} {...cellValue}
                           onClick={(event: MouseEvent<HTMLDivElement>) => onClick && onClick(indexRow, indexCell, cells[indexCell], event)}/>})}
       </div>
   );
}


export default memo(({map, onClick, ...other}: ComponentProps) => {
   return (
       <div className="Controls-Board-wrapper">
           <div className="Controls-Board" {...other}>
               {map.map(renderRow.bind(null, onClick))}
           </div>
       </div>
   )
});