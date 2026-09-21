// All copy for the site lives here. Edit here, nowhere else.

export const meta = {
  title: "Kevin Roovers",
  // The <title> tag. Longer than the name on purpose: this is the line that
  // shows in a search result, and a bare name tells a stranger nothing.
  pageTitle:
    "Kevin Roovers — career frameworks, pay structures and leadership for growing companies",
  description:
    "You have the people. I build the structure they grow in. Career frameworks, pay structures, leadership coaching and ways of working for growing companies.",
  url: "https://kevinroovers.nl", // replace with the real domain
  // Used for the structured data search engines read. Plain subject terms,
  // not keyword stuffing: they describe the work and nothing more.
  subjects: [
    "Career frameworks",
    "Job architecture",
    "Salary bands",
    "EU Pay Transparency Directive",
    "Leadership coaching",
    "CliftonStrengths",
    "Senior and executive hiring",
    "Shape Up",
    "Scaling Up",
    "Functiehuis",
    "Salarishuis",
    "Loopbaanpaden",
    "Leiderschapscoaching",
  ],
  serviceArea: "Netherlands",
};

export const hero = {
  name: "Kevin Roovers",
  line: "You have the people. I build the structure they grow in.",
  scrollHint: "Scroll",
};

export const about = {
  heading: "Loose parts. One organisation.",
  paragraphs: [
    "Twelve years in people and teams. Most of it spent where nothing existed yet. No roles on paper. No career paths. No pay structure. Just people, and a company growing faster than its foundations.",
    "That's where I do my best work. I build the framework. Then I make sure your team leads can run it without me.",
    "Before I built teams in companies, I led one on the baseball field. Top division. Twenty-five players, five staff. Same principle: everyone knows their role, and why it matters.",
  ],
};

export const portrait = {
  src: "/img/kevin-roovers.webp",
  width: 720,
  height: 900,
  alt: "Kevin Roovers",
  caption: "Kevin Roovers, Soesterberg",
};

export const principles = {
  heading: "How I work",
  items: [
    {
      title: "Structure first. Growth follows.",
      text:
        "Talent needs a frame. Clear roles. Visible paths. Fair pay. Then development becomes a choice, not a coincidence.",
    },
    {
      title: "Leaders who can do it themselves.",
      text:
        "I don't build dependency. Your team leads run the cycle. I make myself unnecessary. That's the point.",
    },
    {
      title: "Start with what works.",
      text:
        "As a Gallup-certified CliftonStrengths coach, I begin with strengths. People grow faster on what they can do than on what they lack.",
    },
  ],
};

export const services = {
  heading: "What I build for you",
  intro: "Not maintenance. Foundations.",
  items: [
    {
      id: "framework",
      title: "A career framework. From scratch.",
      what:
        "Job roles, skills profiles and development paths for every person in your company. Live in a platform your team leads actually use.",
      proof:
        "Built for a 28-person tech marketplace where none of it existed. Live in Learned within a year.",
    },
    {
      id: "pay",
      title: "Pay that holds up.",
      what:
        "Salary bands on top of your job architecture. Benchmarked against your market. Ready for the EU Pay Transparency Directive before it's required.",
      proof:
        "Set up ahead of the directive, benchmarked against the Utrecht tech market.",
    },
    {
      id: "leads",
      title: "Team leads who lead.",
      what:
        "A four-month coaching programme built on CliftonStrengths. Team sessions. One-to-one coaching. Designed and delivered by me, in-house.",
      proof:
        "Four team leads now run their own development cycle. No external trainers.",
    },
    {
      id: "hiring",
      title: "The right people. In the right roles.",
      what:
        "Senior and executive hiring, from role design to signed offer. Job posts, channel mix, selection, negotiation.",
      proof:
        "An engineering team from five to eight. Plus a product manager and a CTO.",
    },
    {
      id: "rhythm",
      title: "A rhythm that ships.",
      what:
        "Shape Up for product teams. Scaling Up for the management team. Fewer things at once. More things finished.",
      proof:
        "Rolled out company-wide, with the CTO owning adoption in product and IT.",
    },
    {
      id: "hard",
      title: "The hard conversations.",
      what:
        "Settlement agreements. Long-term absence. Reintegration under Dutch law. Handled directly, with care for the person and certainty for the company.",
      proof:
        "Every case handled as the only people role in the company. Every time.",
    },
  ],
};

// The step-by-step. Written to be read by someone deciding whether to call.
export const process = {
  heading: "How I build it with you",
  intro: "Five steps. The last one is me leaving.",
  steps: [
    {
      title: "We look at what is already there",
      text:
        "Roles, pay, paths, who decides what. Usually some of it exists, undocumented, in someone's head. We write that down before we change anything.",
    },
    {
      title: "We agree what good looks like",
      text:
        "One page: the roles your company actually needs, what each of them is for, and how someone moves between them. You sign off on that page before anything gets built.",
    },
    {
      title: "I build the framework",
      text:
        "Job roles, skills profiles, development paths and salary bands, live in a platform your team leads will use. Built around your company, not around a template.",
    },
    {
      title: "Your team leads take it over",
      text:
        "They run the first cycle. I sit next to them, not in front of them. Where it breaks, we fix it together.",
    },
    {
      title: "I leave",
      text:
        "The framework is yours, the cycle runs without me, and your leads know why every part of it is there. That is the point.",
    },
  ],
};

export const credentials = {
  heading: "Credentials",
  items: [
    "Gallup-certified CliftonStrengths coach",
    "The Psychology of Leadership, Behaviour Change Group",
    "Certified trainer and facilitator, Brout",
    "BASc Leisure Management, Breda University of Applied Sciences",
  ],
};

export const contact = {
  heading: "Let's talk.",
  line: "About structure that still needs building. Or about baseball.",
  email: "kevinroovers@gmail.com",
  linkedin: "https://linkedin.com/in/kevin-roovers",
  linkedinLabel: "LinkedIn",
  location: "Soesterberg, the Netherlands",
};

export const footer = {
  text: "Designed and built in Soesterberg.",
};

// The assistant. Every word it is allowed to say about the work comes from
// this file; `intro` and `prompts` are what a visitor sees before they type.
export const assistant = {
  label: "Ask",
  title: "Ask about the work",
  intro:
    "This assistant answers from what is on this page. For anything else, email me.",
  placeholder: "Type your question",
  prompts: [
    "What would you do first in a 30-person company?",
    "How do salary bands work?",
    "What does a career framework cost me in time?",
    "Can my team leads really run this without you?",
  ],
  disclaimer: "AI assistant. It can be wrong — email me if it matters.",
};
