// Alle tekst van de site staat hier. Pas het hier aan, nergens anders.
//
// Toon: kort, stellend, tegen één lezer. Begin bij zijn situatie, niet bij mijn
// cv. Geen versterkers, geen vakjargon voordat de menselijke zin er staat.
// Een omkering zegt meer dan een bijvoeglijk naamwoord.

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
    "Rollen en rolprofielen",
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
    "Er komt een moment dat groei gaat schuren. Mensen worden leidinggevende zonder ooit geleid te hebben. Niemand weet wat de volgende stap is. Niemand kan uitleggen welk gedrag hier beloond wordt. Wat werkte bij vijftien mensen, werkt niet meer bij veertig.",
    "Dat vraagt geen beleid. Dat vraagt vorm. Acht jaar scale-up leerde me waar die vorm begint: bij wat mensen kunnen, niet bij wat er op hun contract staat.",
    "Op een honkbalveld zie je dat meteen. Ik leidde er een team in de hoofdklasse. Vijfentwintig spelers, vijf man staf. Een speler op de verkeerde positie kost je de wedstrijd, hoe goed die speler ook is. In een bedrijf duurt het langer voor je het ziet. Het kost net zo hard.",
    "Dus begin ik bij talent. Eerst wat iemand van nature goed kan. Dan pas welke positie daarbij hoort.",
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
  heading: "Waar ik van uitga",
  items: [
    {
      title: "Vrijheid heeft vorm nodig.",
      text:
        "Zonder kader is ontwikkeling toeval. Heldere rollen. Zichtbare paden. Eerlijke beloning. Dan wordt groeien een keuze.",
    },
    {
      title: "Ik bouw mezelf eruit.",
      text:
        "Niet ik voer de gesprekken. Jouw teamleads voeren ze. Overbodig worden is het doel, niet het risico.",
    },
    {
      title: "Je wint niet met de beste spelers.",
      text:
        "Je wint met spelers op de juiste positie. Als Gallup-gecertificeerd CliftonStrengths-coach begin ik daarom bij wat iemand al kan.",
    },
  ],
};

// Het stappenplan. Geschreven voor iemand die zit te twijfelen of hij belt.
export const process = {
  heading: "Hoe het gaat",
  intro: "Vijf stappen. De laatste is mijn vertrek.",
  steps: [
    {
      title: "We kijken wat er al is",
      text:
        "Rollen, beloning, paden, wie waarover beslist. Het meeste bestaat al, ongeschreven, in iemands hoofd. Dat zetten we eerst op papier. Veranderen komt later.",
    },
    {
      title: "We spreken af wat goed is",
      text:
        "Eén pagina: welke rollen je echt nodig hebt, waar ze voor zijn, hoe iemand van de ene naar de andere beweegt. Jij tekent. Daarna pas bouwen we.",
    },
    {
      title: "Ik bouw het raamwerk",
      text:
        "Rollen, skills, loopbaanpaden, salarisbandbreedtes. Live in een platform dat je teamleads echt gebruiken. Om jouw bedrijf heen gebouwd, niet om een sjabloon.",
    },
    {
      title: "Je teamleads nemen het over",
      text:
        "Zij voeren de eerste gesprekken zelf. Ik zit ernaast, niet ervoor. Waar het vastloopt, lossen we het samen op.",
    },
    {
      title: "Ik ga weg",
      text:
        "Het raamwerk is van jullie. Het loopt zonder mij. En je leads weten waarom elk onderdeel er staat.",
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
        "De beste organisaties weten wat hun mensen kunnen, niet welke functie ze hebben.",
      what:
        "Een huis van rollen, niet van functies. Wat mensen doen en kunnen, met de skills en ontwikkelpaden die daarbij horen. Live in een platform dat je teamleads echt gebruiken.",
      proof:
        "Gebouwd voor een tech-marktplaats van 28 mensen waar niets van dit alles bestond. Binnen een jaar live in Learned.",
      bron: "Work Without Jobs, Jesuthasan & Boudreau · The Skills-Powered Organization, Jesuthasan & Kapilashrami",
    },
    {
      id: "pay",
      title:
        "De beste organisaties halen geld van tafel, zodat het over het werk kan gaan.",
      what:
        "Een salarishuis bovenop je rollen. Bandbreedtes, gebenchmarkt tegen jouw markt. Klaar voor de EU-richtlijn loontransparantie voordat het moet.",
      proof:
        "Opgezet vóór de richtlijn, gebenchmarkt tegen de Utrechtse tech-markt.",
      bron: "Drive, Daniel Pink · Powerful, Patty McCord",
    },
    {
      id: "leads",
      title:
        "De beste organisaties weten dat betrokkenheid in het team ontstaat, niet in het beleid.",
      what:
        "Vier maanden coaching voor je teamleads, op basis van CliftonStrengths. Teamsessies. Eén-op-één. Door mij ontworpen en gegeven, in huis.",
      proof:
        "Vier teamleads voeren hun ontwikkelgesprekken nu zelf. Zonder externe trainers.",
      bron: "It's the Manager, Clifton & Harter · Nine Lies About Work, Buckingham & Goodall",
    },
    {
      id: "hiring",
      title:
        "De beste organisaties selecteren op methode, niet op onderbuik.",
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
        "Een werkritme dat past bij hoe jouw teams werken. Vaste blokken, een duidelijke eigenaar per stuk werk, en een plek waar keuzes vallen. Minder tegelijk. Meer af.",
      proof:
        "Bij een tech-scale-up werd dat Shape Up voor de productteams en Scaling Up voor het MT. Bedrijfsbreed uitgerold, met de CTO als eigenaar.",
      bron: "Deep Work, Cal Newport · The Progress Principle, Amabile & Kramer",
    },
    {
      id: "hard",
      title:
        "De beste organisaties voeren het moeilijke gesprek op tijd. Uitstellen is niet aardig, het is duur.",
      what:
        "Vaststellingsovereenkomsten. Langdurig verzuim. Re-integratie volgens Nederlands arbeidsrecht. Recht op de zaak af, met zorg voor de mens en zekerheid voor het bedrijf.",
      proof:
        "Elke zaak zelf gedaan, als enige people-rol in het bedrijf. Elke keer.",
      bron: "Radical Candor, Kim Scott · Powerful, Patty McCord",
    },
  ],
};

export const credentials = {
  heading: "Waar ik het vandaan heb",
  items: [
    "Gallup-gecertificeerd CliftonStrengths-coach",
    "The Psychology of Leadership, Behaviour Change Group",
    "Gecertificeerd trainer en facilitator, Brout",
    "Sturen op mandaat, Neuromanagement (Sven Gall)",
  ],
};

export const contact = {
  heading: "Laten we praten.",
  line: "Over wat er nog gebouwd moet worden. Of over honkbal.",
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
