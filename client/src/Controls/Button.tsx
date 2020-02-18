import React, {memo, ReactElement} from 'react'
import 'Controls/Button/Button.less'

export interface ComponentProps {
    className?: string,
    children: ReactElement
}

export default memo(({className='', children, ...attributes}: ComponentProps) => {
    return (
        <div className={'Controls-Button ' + className} {...attributes}>{children}</div>
    )
})
