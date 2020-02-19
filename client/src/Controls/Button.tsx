import React, {memo, HTMLAttributes} from 'react'
import 'Controls/Button/Button.less'

export default memo(({className='', children, ...attributes}: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={'Controls-Button ' + className} {...attributes}>{children}</div>
    )
})
