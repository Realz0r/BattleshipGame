import React from 'react'
import {render} from 'react-dom'
import 'Controls/InfoBox/InfoBox.less'

let infoBoxDOM: HTMLElement;
let timerAutoHide: number;

function show(content, target?: HTMLElement, delay?: number) {
    if (!infoBoxDOM) {
        infoBoxDOM = document.createElement('div');
        infoBoxDOM.className = 'Controls-InfoBox Controls-InfoBox_hide';
        document.body.prepend(infoBoxDOM);
    }

    if (target instanceof HTMLElement) {
        const coordinatesTarget = target.getBoundingClientRect();

        infoBoxDOM.style.left = coordinatesTarget.right + 'px';
        infoBoxDOM.style.top = coordinatesTarget.bottom + 'px';
    }

    if (content) {
        render(<div className="Controls-InfoBox-wrapper-content">{content}</div>, infoBoxDOM);
    }

    clearTimeout(timerAutoHide);
    infoBoxDOM.classList.remove('Controls-InfoBox_hide');

    if (delay) {
        timerAutoHide = setTimeout(hide, delay);
    }
}

function hide() {
    infoBoxDOM.classList.add('Controls-InfoBox_hide');
}

export {
    show,
    hide
}