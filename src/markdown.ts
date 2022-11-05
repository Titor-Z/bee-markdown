//@ts-ignore
import hljs from "highlight.js";
import { readFileSync } from "fs";
import Config from "./config";

export default class Markdown extends Config {
  protected md = require("markdown-it")({
    html: true,
    linkify: false,
    xhtmlOut: true,
    breaks: true,
    langPrefix: "lang-",

    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class='hljs'><code>${
            hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
          }</code></pre>`;
        } catch (__) {}
      }

      return `<pre class="hljs">${this.md.utils.escapeHtml(
        str
      )}<code></code></pre>`;
    },
  }).enable(["link"]);

  constructor() {
    super();
  }
}
