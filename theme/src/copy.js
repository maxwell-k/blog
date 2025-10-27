// deno-lint-ignore-file no-window

const delay = 2000;

document.querySelectorAll("div.highlight > pre > code").forEach((node) => {
  node.parentNode.parentNode.insertAdjacentHTML(
    "beforeend",
    "<button>Copy 📋</button>",
  );
});

function copy(event) {
  const text = event.target.previousSibling.innerText.trimEnd();
  navigator.clipboard.writeText(text).then(
    () => {
      const before = event.target.innerText;
      setTimeout(() => {
        event.target.innerText = before;
      }, delay);
      event.target.innerText = "Copied.";
    },
    () => {
      const before = event.target.innerText;
      setTimeout(() => {
        event.target.innerText = before;
      }, delay);
      event.target.innerText = "Error, copy selection manually.";
      const range = document.createRange();
      range.selectNodeContents(event.target.previousSibling);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    },
  );
}

document
  .querySelectorAll("button")
  .forEach((e) => e.addEventListener("click", copy));

// theme/src/copy.js
// Copyright 2024 Keith Maxwell
// SPDX-License-Identifier: MPL-2.0
