import React, {memo} from 'react';
import Cell, {ComponentProps as ComponentPropsCell} from 'Controls/Cell';
import 'Controls/Board/Board.less';

export type mapType = Array<Array<ComponentPropsCell>>
export interface ComponentProps {
    map: mapType
    onClick?: Function
}

function renderRow(onClick: Function|void, cells: string[], indexRow: number) {
   return (
       <div className="Controls-Board_row" key={indexRow}>
          {cells.map((cellValue: string, indexCell: number) => {
              return <Cell key={indexCell} {...cellValue}
                           onClick={(event) => onClick && onClick(indexRow, indexCell, cells[indexCell], event)}/>})}
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