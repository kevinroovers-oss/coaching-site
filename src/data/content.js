// Alle tekst van de site staat hier. Pas het hier aan, nergens anders.

export const meta = {
  title: "Kevin Roovers",
  // De <title>-tag. Langer dan alleen de naam, met opzet: dit is de regel die
  // in een zoekresultaat staat, en een kale naam zegt een vreemde niets.
  pageTitle:
    "Kevin Roovers — functiehuis, salarishuis en leiderschap voor groeiende bedrijven",
  description:
    "Je hebt de mensen. Ik bouw de structuur waarin ze groeien. Functiehuizen, salarishuizen, leiderschapscoaching en werkritme voor groeiende bedrijven.",
  url: "https://kevinroovers.nl", // vervang door het echte domein
  // Voor de structured data die zoekmachines lezen. Gewone vaktermen, geen
  // keyword stuffing: ze beschrijven het werk en verder niets.
  subjects: [
    "Functiehuis",
    "Salarishuis",
    "Salarisbandbreedtes",
    "Loopbaanpaden",
    "Functieprofielen",
    "EU-richtlijn loontransparantie",
    "Leiderschapscoaching",
    "CliftonStrengths",
    "Teamleads coachen",
    "Senior en executive werving",
    "Shape Up",
    "Scaling Up",
    "Interim HR",
    "Scale-ups",
  ],
  serviceArea: "Nederland",
  language: "nl",
};

export const hero = {
  name: "Kevin Roovers",
  line: "Je hebt de mensen. Ik bouw de structuur waarin ze groeien.",
  scrollHint: "Scroll",
};

export const about = {
  heading: "Losse onderdelen. Eén organisatie.",
  paragraphs: [
    "Acht jaar in scale-ups. Mens, team en organisatie, alle drie tegelijk. Meestal op plekken waar nog niets stond. Geen functies op papier. Geen loopbaanpaden. Geen salarisstructuur. Alleen mensen, en een bedrijf dat harder groeide dan zijn fundament.",
    "Daar doe ik mijn beste werk. Ik bouw het raamwerk. En dan zorg ik dat je teamleads het zonder mij draaien.",
    "Voordat ik teams bouwde in bedrijven, leidde ik er een op het honkbalveld. Hoofdklasse. Vijfentwintig spelers, vijf man staf. Zelfde principe: iedereen kent zijn rol, en waarom die ertoe doet.",
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
  heading: "Hoe ik werk",
  items: [
    {
      title: "Eerst structuur. Groei volgt.",
      text:
        "Talent heeft een kader nodig. Heldere rollen. Zichtbare paden. Eerlijke beloning. Dan wordt ontwikkeling een keuze in plaats van toeval.",
    },
    {
      title: "Leiders die het zelf kunnen.",
      text:
        "Ik bouw geen afhankelijkheid. Je teamleads draaien de cyclus. Ik maak mezelf overbodig. Dat is de bedoeling.",
    },
    {
      title: "Begin bij wat werkt.",
      text:
        "Als Gallup-gecertificeerd CliftonStrengths-coach begin ik bij sterke punten. Mensen groeien sneller op wat ze kunnen dan op wat ze missen.",
    },
  ],
};

// Het stappenplan. Geschreven voor iemand die zit te twijfelen of hij belt.
export const process = {
  heading: "Hoe ik het met je opbouw",
  intro: "Vijf stappen. De laatste is mijn vertrek.",
  steps: [
    {
      title: "We kijken naar wat er al is",
      text:
        "Rollen, beloning, paden, wie waarover beslist. Meestal bestaat een deel al, ongeschreven, in iemands hoofd. Dat zetten we eerst op papier. Daarna pas veranderen we iets.",
    },
    {
      title: "We spreken af wat goed is",
      text:
        "Eén pagina: welke rollen je bedrijf echt nodig heeft, waar elke rol voor is, en hoe iemand van de ene naar de andere beweegt. Jij tekent voor die pagina voordat er iets gebouwd wordt.",
    },
    {
      title: "Ik bouw het raamwerk",
      text:
        "Functieprofielen, skills, loopbaanpaden en salarisbandbreedtes. Live in een platform dat je teamleads echt gebruiken. Gebouwd rond jouw bedrijf, niet rond een sjabloon.",
    },
    {
      title: "Je teamleads nemen het over",
      text:
        "Zij draaien de eerste cyclus. Ik zit ernaast, niet ervoor. Waar het vastloopt, lossen we het samen op.",
    },
    {
      title: "Ik ga weg",
      text:
        "Het raamwerk is van jullie, de cyclus draait zonder mij, en je leads weten waarom elk onderdeel er staat. Dat is de bedoeling.",
    },
  ],
};

export const services = {
  heading: "Wat ik voor je bouw",
  intro: "Geen onderhoud. Fundament.",
  // De titel is de overtuiging, niet het product. Alle zes beginnen hetzelfde,
  // met opzet: zo leest de lijst als een manifest en springt het verschil eruit.
  // Het product staat in `wat` — dat is de "hoe", die je later kunt aanscherpen.
  // `bron` verwijst naar de boeken uit je eigen bibliotheek waar de claim op rust.
  items: [
    {
      id: "framework",
      title:
        "De beste organisaties weten wat hun mensen kunnen, niet alleen welke functie ze hebben.",
      what:
        "Een functiehuis vanaf nul: functies, skillsprofielen en ontwikkelpaden voor iedereen in je bedrijf. Live in een platform dat je teamleads echt gebruiken.",
      proof:
        "Gebouwd voor een tech-marktplaats van 28 mensen waar niets van dit alles bestond. Binnen een jaar live in Learned.",
      bron: "Work Without Jobs, Jesuthasan & Boudreau · The Skills-Powered Organization, Jesuthasan & Kapilashrami",
    },
    {
      id: "pay",
      title:
        "De beste organisaties halen geld van tafel als gespreksonderwerp, zodat het over het werk kan gaan.",
      what:
        "Een salarishuis bovenop je functiehuis: salarisbandbreedtes, gebenchmarkt tegen jouw markt. Klaar voor de EU-richtlijn loontransparantie voordat het moet.",
      proof:
        "Opgezet vóór de richtlijn, gebenchmarkt tegen de Utrechtse tech-markt.",
      bron: "Drive, Daniel Pink · Powerful, Patty McCord",
    },
    {
      id: "leads",
      title:
        "De beste organisaties weten dat betrokkenheid in het team ontstaat, niet in het personeelsbeleid.",
      what:
        "Een coachingsprogramma van vier maanden voor je teamleads, op basis van CliftonStrengths. Teamsessies. Eén-op-één coaching. Door mij ontworpen en gegeven, in huis.",
      proof:
        "Vier teamleads draaien nu hun eigen ontwikkelcyclus. Zonder externe trainers.",
      bron: "It's the Manager, Clifton & Harter · Nine Lies About Work, Buckingham & Goodall",
    },
    {
      id: "hiring",
      title:
        "De beste organisaties selecteren op een vaste methode, niet op een goed gevoel.",
      what:
        "Senior en executive werving, van rolontwerp tot getekend aanbod. Vacatureteksten, kanaalmix, gestructureerde selectie, onderhandeling.",
      proof:
        "Een engineeringteam van vijf naar acht. Plus een productmanager en een CTO.",
      bron: "Work Rules!, Laszlo Bock · Noise, Kahneman, Sibony & Sunstein",
    },
    {
      id: "rhythm",
      title:
        "De beste organisaties belonen afgemaakt werk, niet zichtbare drukte.",
      what:
        "Een werkritme dat oplevert: Shape Up voor productteams, Scaling Up voor het MT. Minder dingen tegelijk. Meer dingen af.",
      proof:
        "Bedrijfsbreed uitgerold, met de CTO als eigenaar van de adoptie in product en IT.",
      bron: "Deep Work, Cal Newport · The Progress Principle, Amabile & Kramer",
    },
    {
      id: "hard",
      title:
        "De beste organisaties voeren het moeilijke gesprek op tijd, omdat uitstellen niet aardig is maar duur.",
      what:
        "Vaststellingsovereenkomsten. Langdurig verzuim. Re-integratie volgens Nederlands arbeidsrecht. Rechtstreeks aangepakt, met zorg voor de mens en zekerheid voor het bedrijf.",
      proof:
        "Elke zaak zelf gedaan, als enige people-rol in het bedrijf. Elke keer.",
      bron: "Radical Candor, Kim Scott · Powerful, Patty McCord",
    },
  ],
};

export const credentials = {
  heading: "Opleiding en certificering",
  items: [
    "Gallup-gecertificeerd CliftonStrengths-coach",
    "The Psychology of Leadership, Behaviour Change Group",
    "Gecertificeerd trainer en facilitator, Brout",
    "Sturen op mandaat, Neuromanagement (Sven Gall)",
  ],
};

export const contact = {
  heading: "Laten we praten.",
  line: "Over structuur die nog gebouwd moet worden. Of over honkbal.",
  email: "kevinroovers@gmail.com",
  linkedin: "https://linkedin.com/in/kevin-roovers",
  linkedinLabel: "LinkedIn",
  location: "Soesterberg, Nederland",
};

export const footer = {
  text: "Ontworpen en gebouwd in Soesterberg.",
};

// Korte labels op knoppen die geen zichtbare tekst hebben. Geen sitetekst,
// maar een schermlezer heeft ze nodig.
export const ui = {
  sound: "Geluid",
  close: "Sluiten",
  send: "Versturen",
};

// De assistent. Alles wat hij over het werk mag zeggen komt uit dit bestand;
// `intro` en `prompts` zijn wat een bezoeker ziet voordat hij typt.
export const assistant = {
  label: "Vraag",
  title: "Stel een vraag over het werk",
  intro:
    "Deze assistent antwoordt op basis van wat op deze pagina staat. Voor al het andere: mail me.",
  placeholder: "Typ je vraag",
  prompts: [
    "Wat zou je als eerste doen bij een bedrijf van 30 mensen?",
    "Hoe werken salarisbandbreedtes?",
    "Hoeveel tijd kost een functiehuis mij?",
    "Kunnen mijn teamleads dit echt zonder jou draaien?",
  ],
  disclaimer: "AI-assistent. Kan het mis hebben — mail me als het ertoe doet.",
  // Wat de assistent zegt als er iets misgaat. Hij faalt nooit stil.
  errors: {
    offline:
      "De assistent draait alleen op de gepubliceerde site. Mail me intussen op kevinroovers@gmail.com.",
    unreachable:
      "Ik kon de assistent niet bereiken. Mail me op kevinroovers@gmail.com.",
    generic: "Er ging iets mis aan mijn kant.",
  },
};
