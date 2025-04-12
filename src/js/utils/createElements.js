function createElement(tag, className, id = undefined, attributes = {}, text = '') {
    const el = document.createElement(tag);
    if (className) {
        className.split(' ').forEach(clss => {
            el.classList.add(clss);
        })
    }
    if (id) el.id = id
    Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
    el.textContent = text;
    return el;
}

export {
    createElement
}