interface AnswerEventFire {
    withShip: boolean
    isKilled: boolean
}

function getUrlWithParameters(path, params): URL {
    const url = new URL(window.location.href + path);

    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            url.searchParams.set(key, params[key]);
        }
    }

    return url;
}

function createEventSource(paramsUrl, listEvents, eventsCallback: Function): EventSource {
    const url: URL = getUrlWithParameters('battleshipListener', paramsUrl);
    const listenerSource: EventSource = new EventSource(url.toString());

    listEvents.forEach((eventName: string) => {
        // @ts-ignore
        listenerSource.addEventListener(eventName, ({data}) => {
            eventsCallback(eventName, JSON.parse(data));
        });
    });

    return listenerSource;
}

function sendEvent(eventName, params = {}): Promise<AnswerEventFire> {
    const senderSource: XMLHttpRequest = new XMLHttpRequest();
    const url = getUrlWithParameters('battleship', params);

    url.searchParams.set('event', eventName);
    senderSource.open('GET', url.toString());
    senderSource.responseType = 'json';

    return new Promise((resolve, reject) => {
        senderSource.onerror = reject;
        senderSource.onload = () => {
            resolve(senderSource.response);
        };

        senderSource.send();
    });
}

export {
    AnswerEventFire,
    createEventSource,
    sendEvent
}