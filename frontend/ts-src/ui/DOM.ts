type CreateElementOptions = {
  text?: string;
  id?: string;
  className?: string;
  classList?: string[];
};

type HTLMTag = 'button' | 'div' | 'h1' | 'p';

function createElement(tag: HTLMTag, options?: CreateElementOptions): HTMLElement {
  const el = document.createElement(tag);

  if (options) {
    const { text, id, classList, className } = options;
    if (id) el.id = id;
    if (text) el.innerText = text;
    if (className) el.className = className;
    if (classList) el.classList.add(...classList);
  }

  return el;
}

function $(id: string): HTMLElement | null {
  return document.getElementById(id);
}

export { $, createElement };
