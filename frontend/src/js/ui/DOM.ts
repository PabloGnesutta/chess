type CreateElementOptions = {
  text?: string;
  id?: string;
  classList?: string[];
};

function createElement(tag: string, options?: CreateElementOptions): HTMLElement {
  const el = document.createElement(tag);

  if (options) {
    const { text, id, classList } = options;
    if (text) el.innerText = text;
    if (id) el.id = id;
    if (classList) el.classList.add(...classList);
  }

  return el;
}

export { createElement };
