type CreateElementOptions = {
  text?: string;
  id?: string;
  classList?: string[];
};

type HTLMTag = 'button' | 'div' | 'h1' | 'p';

function createElement(tag: HTLMTag, options?: CreateElementOptions): HTMLElement {
  const el = document.createElement(tag);

  if (options) {
    const { text, id, classList } = options;
    if (id) el.id = id;
    if (text) el.innerText = text;
    if (classList) el.classList.add(...classList);
  }

  return el;
}

export { createElement };
