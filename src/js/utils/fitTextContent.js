function fitTextContent(selector, offset = 20, scale = 2.2) {
    const elem = document.querySelector(selector);
    if (!elem) return;

    const parent = elem.parentNode;
    if (!parent) return;

    const parentHeight = parent.clientHeight;

    elem.style.fontSize = '1.5rem';
    elem.style.transition = 'none';

    if (elem.clientHeight > (parentHeight - offset)) {
        $(selector).fitText(scale);
    }
}

export {
    fitTextContent
}