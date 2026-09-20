// Renders /src/data/content.js into index.html at build time.
//
// The brief says every word lives in content.js. Rendering the page from JS at
// runtime would honour that but cost us real HTML — bad for first paint, bad
// for search, bad for anyone with JS off. So the copy is injected here instead:
// one source of truth, static markup in the output.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Splits a sentence-per-line headline into spans the reveal can mask.
const lines = (s) => `<span class="line"><span class="line-i">${esc(s)}</span></span>`;

export default function contentPlugin() {
  const file = path.resolve('src/data/content.js');
  return {
    name: 'kr-content',
    // 'pre' matters: Vite's own HTML plugin runs decodeURI over href/src, and
    // a raw %TOKEN% in a URL attribute is not a valid escape sequence. The copy
    // has to be in place before it looks.
    transformIndexHtml: {
      order: 'pre',
      async handler(html, ctx) {
        if (!ctx.filename.endsWith('index.html')) return html;
        // Cache-bust in dev so editing content.js refreshes the page.
        const mod = await import(pathToFileURL(file).href + '?t=' + Date.now());
        return render(html, mod);
      },
    },
    handleHotUpdate({ file: changed, server }) {
      if (changed === file) server.ws.send({ type: 'full-reload' });
    },
  };
}

function render(html, c) {
  const { meta, hero, about, principles, services, credentials, contact, footer } = c;

  const aboutParas = about.paragraphs
    .map((p) => `<p class="body reveal">${esc(p)}</p>`)
    .join('\n          ');

  const principleItems = principles.items
    .map(
      (it, i) => `
          <li class="principle reveal" data-principle="${i}">
            <span class="num">${String(i + 1).padStart(2, '0')}</span>
            <h3 class="h3">${lines(it.title)}</h3>
            <p class="body">${esc(it.text)}</p>
          </li>`
    )
    .join('');

  const serviceItems = services.items
    .map(
      (it, i) => `
          <li class="service reveal">
            <button class="service-card" type="button" data-service="${i}" data-id="${esc(it.id)}"
              aria-haspopup="dialog" aria-controls="overlay">
              <span class="num">${String(i + 1).padStart(2, '0')}</span>
              <span class="service-title">${esc(it.title)}</span>
              <span class="service-mark" aria-hidden="true"></span>
            </button>
          </li>`
    )
    .join('');

  const credentialItems = credentials.items
    .map((it) => `<li class="credential reveal">${esc(it)}</li>`)
    .join('\n            ');

  const serviceData = JSON.stringify(
    services.items.map(({ id, title, what, proof }) => ({ id, title, what, proof }))
  );

  const replacements = {
    '%TITLE%': esc(meta.title),
    '%DESCRIPTION%': esc(meta.description),
    '%URL%': esc(meta.url),
    // One word per line. Not a rewrite — a line break. Two big stacked lines
    // read better than one long one, they clear the scene on the right, and
    // they give the staggered reveal something to stagger.
    '%HERO_NAME%': hero.name.split(' ').map(lines).join(''),
    '%HERO_LINE%': hero.line
      .split('. ')
      .map((part, i, arr) => lines(i < arr.length - 1 ? part + '.' : part))
      .join(''),
    '%SCROLL_HINT%': esc(hero.scrollHint),
    '%ABOUT_HEADING%': lines(about.heading.split('. ')[0] + '.') + lines(about.heading.split('. ')[1]),
    '%ABOUT_PARAGRAPHS%': aboutParas,
    '%PRINCIPLES_HEADING%': lines(principles.heading),
    '%PRINCIPLE_ITEMS%': principleItems,
    '%SERVICES_HEADING%': lines(services.heading),
    '%SERVICES_INTRO%': esc(services.intro),
    '%SERVICE_ITEMS%': serviceItems,
    '%SERVICE_DATA%': serviceData.replace(/</g, '\\u003c'),
    '%CREDENTIALS_HEADING%': lines(credentials.heading),
    '%CREDENTIAL_ITEMS%': credentialItems,
    '%CONTACT_HEADING%': lines(contact.heading),
    '%CONTACT_LINE%': esc(contact.line),
    '%EMAIL%': esc(contact.email),
    '%LINKEDIN%': esc(contact.linkedin),
    '%LINKEDIN_LABEL%': esc(contact.linkedinLabel),
    '%LOCATION%': esc(contact.location),
    '%FOOTER%': esc(footer.text),
  };

  let out = html;
  for (const [k, v] of Object.entries(replacements)) out = out.split(k).join(v);
  return out;
}
