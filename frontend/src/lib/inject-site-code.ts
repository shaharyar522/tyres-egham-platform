const MARKER = "data-site-custom-code";

/** Remove previously injected head/body custom code nodes. */
export function clearSiteCustomCode() {
  document.querySelectorAll(`[${MARKER}]`).forEach((node) => node.remove());
}

/**
 * Parse an HTML snippet and append executable nodes to a target.
 * Script tags are recreated so browsers will run them.
 */
export function injectSiteCustomCode(target: ParentNode, html: string, slot: "head" | "body") {
  const trimmed = html.trim();
  if (!trimmed) return;

  const template = document.createElement("template");
  template.innerHTML = trimmed;

  Array.from(template.content.childNodes).forEach((node) => {
    const injected = materializeNode(node);
    if (!injected) return;
    if (injected instanceof Element) {
      injected.setAttribute(MARKER, slot);
    }
    target.appendChild(injected);
  });
}

function materializeNode(node: ChildNode): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";
    return text.trim() ? document.createTextNode(text) : null;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const el = node as Element;

  if (el.tagName.toLowerCase() === "script") {
    const script = document.createElement("script");
    Array.from(el.attributes).forEach((attr) => {
      script.setAttribute(attr.name, attr.value);
    });
    script.text = el.textContent ?? "";
    return script;
  }

  return el.cloneNode(true);
}
