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

    // A one-page site needs a one-line sitemap, but search engines still ask
    // for it, and it is the cheapest way to hand over the canonical URL.
    async generateBundle() {
      const mod = await import(pathToFileURL(file).href + '?t=' + Date.now());
      const today = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          `  <url><loc>${mod.meta.url}/</loc><lastmod>${today}</lastmod>` +
          '<changefreq>monthly</changefreq><priority>1.0</priority></url>\n' +
          '</urlset>\n',
      });
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

  // The detail lives in the DOM, hidden until the overlay opens, rather than in
  // a JSON blob. Same click behaviour; the difference is that a crawler and a
  // visitor without JavaScript can both read it — and since the searchable
  // words (functiehuis, salarishuis) moved out of the titles into `what`, that
  // matters more than it used to.
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
            <div class="service-detail" id="service-${i}" hidden>
              <p data-field="what">${esc(it.what)}</p>
              <p data-field="proof">${esc(it.proof)}</p>
              ${it.bron ? `<p data-field="bron">${esc(it.bron)}</p>` : ''}
            </div>
          </li>`
    )
    .join('');

  const processSteps = c.process.steps
    .map(
      (st, i) => `
          <li class="step reveal">
            <span class="step-num">${String(i + 1).padStart(2, '0')}</span>
            <div class="step-body">
              <h3 class="h3">${lines(st.title)}</h3>
              <p class="body">${esc(st.text)}</p>
            </div>
          </li>`
    )
    .join('');

  const assistantPrompts = c.assistant.prompts
    .map((q) => `<button class="ask-prompt" type="button">${esc(q)}</button>`)
    .join('\n            ');

  // Structured data. Describes the person and the service in the vocabulary
  // search engines index, using only facts already in this file.
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${meta.url}/#kevin`,
        name: hero.name,
        description: hero.line,
        url: meta.url,
        image: `${meta.url}${c.portrait.src}`,
        email: `mailto:${contact.email}`,
        sameAs: [contact.linkedin],
        address: { '@type': 'PostalAddress', addressLocality: 'Soesterberg', addressCountry: 'NL' },
        knowsAbout: meta.subjects,
        hasCredential: credentials.items.map((t) => ({
          '@type': 'EducationalOccupationalCredential',
          name: t,
        })),
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${meta.url}/#service`,
        name: hero.name,
        description: meta.description,
        url: meta.url,
        inLanguage: meta.language || 'nl',
        provider: { '@id': `${meta.url}/#kevin` },
        areaServed: { '@type': 'Country', name: meta.serviceArea },
        knowsAbout: meta.subjects,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: services.heading,
          itemListElement: services.items.map((it) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: it.title, description: it.what },
          })),
        },
      },
      {
        '@type': 'HowTo',
        name: c.process.heading,
        description: c.process.intro,
        step: c.process.steps.map((st, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: st.title,
          text: st.text,
        })),
      },
    ],
  }).replace(/</g, '\\u003c');

  const credentialItems = credentials.items
    .map((it) => `<li class="credential reveal">${esc(it)}</li>`)
    .join('\n            ');

  const replacements = {
    '%UI_SOUND%': esc(c.ui.sound),
    '%UI_CLOSE%': esc(c.ui.close),
    '%UI_SEND%': esc(c.ui.send),
    '%ASK_STRINGS%': JSON.stringify(c.assistant.errors).replace(/</g, '\\u003c'),
    '%PAGE_TITLE%': esc(meta.pageTitle || meta.title),
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
    '%CREDENTIALS_HEADING%': lines(credentials.heading),
    '%CREDENTIAL_ITEMS%': credentialItems,
    '%CONTACT_HEADING%': lines(contact.heading),
    '%CONTACT_LINE%': esc(contact.line),
    '%EMAIL%': esc(contact.email),
    '%LINKEDIN%': esc(contact.linkedin),
    '%LINKEDIN_LABEL%': esc(contact.linkedinLabel),
    '%LOCATION%': esc(contact.location),
    '%FOOTER%': esc(footer.text),
    '%PROCESS_HEADING%': lines(c.process.heading),
    '%PROCESS_INTRO%': esc(c.process.intro),
    '%PROCESS_STEPS%': processSteps,
    '%PORTRAIT_SRC%': esc(c.portrait.src),
    '%PORTRAIT_W%': String(c.portrait.width),
    '%PORTRAIT_H%': String(c.portrait.height),
    '%PORTRAIT_ALT%': esc(c.portrait.alt),
    '%PORTRAIT_CAPTION%': esc(c.portrait.caption),
    '%ASK_LABEL%': esc(c.assistant.label),
    '%ASK_TITLE%': esc(c.assistant.title),
    '%ASK_INTRO%': esc(c.assistant.intro),
    '%ASK_PLACEHOLDER%': esc(c.assistant.placeholder),
    '%ASK_PROMPTS%': assistantPrompts,
    '%ASK_DISCLAIMER%': esc(c.assistant.disclaimer),
    '%JSON_LD%': jsonLd,
  };

  let out = html;
  for (const [k, v] of Object.entries(replacements)) out = out.split(k).join(v);
  return out;
}
