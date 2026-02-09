import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import sql from 'highlight.js/lib/languages/sql';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import 'highlight.js/styles/atom-one-dark.css'; // Theme

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false, // Explicitly disable hard breaks to avoid excess <br> tags
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs-wrapper"><div class="code-header"><span>${lang}</span><button class="copy-btn" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.innerText).then(()=>this.textContent='Copied!').catch(()=>this.textContent='Error').finally(()=>setTimeout(()=>this.textContent='Copy', 2000))">Copy</button></div><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch (__) {}
    }

    // Fallback
    return `<pre class="hljs-wrapper"><div class="code-header"><span>text</span><button class="copy-btn" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.innerText).then(()=>this.textContent='Copied!').catch(()=>this.textContent='Error').finally(()=>setTimeout(()=>this.textContent='Copy', 2000))">Copy</button></div><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

export const renderMarkdown = (text: string) => {
  return md.render(text);
};
