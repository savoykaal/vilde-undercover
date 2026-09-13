// All player-facing text. Swap this object to change language.

export const strings = {
  appName: 'Agent Vilde',
  appTagline: 'Familiebureauet',

  brand: {
    name: 'FAMILIEBUREAUET',
    tagline: 'Tophemmeligt · kun for agenter',
  },

  common: {
    back: 'Tilbage',
    cancel: 'Annullér',
  },

  difficulty: {
    let: 'Let',
    mellem: 'Mellem',
    svaer: 'Svær',
  },

  difficultyInfo: {
    let: 'Tabel 1–5 · vælg mellem fire svar',
    mellem: 'Tabel 1–5 · tast selv koden',
    svaer: 'Tabel 1–10 · tast selv · på tid',
  },

  emblems: {
    bolt: 'Lyn',
    star: 'Stjerne',
    eye: 'Øje',
    key: 'Nøgle',
    diamond: 'Diamant',
    moon: 'Måne',
  },

  home: {
    agentCard: 'Agentkort',
    codename: 'Kodenavn',
    status: 'Status: aktiv',
    switchAgent: 'Skift agent',
    clearance: 'Sikkerhedsniveau',
    board: 'Åbne sager',
    caseLabel: 'SAG',
    topSecret: 'Tophemmeligt',
    parentButton: 'Forældre',
    briefingSpeaker: 'Janni · bureauchef',
    briefings: [
      'Fire sager ligger klar. Du bestemmer selv, hvor vi starter.',
      'Frej har spist alle kiksene i kælderen igen. Sagerne er heldigvis urørte.',
      'Mynthe har opgraderet kodelåsene i nat. Hun siger, du klarer dem.',
      'Søren har tanket vognen og lavet kakao. Bureauet er klar, når du er.',
      'Lyst til ro? Muldvarpen har intet stopur. Lyst til fart? Prøv Kodelåsen.',
      'Godt at se dig, agent. Kælderen er sikret, og kaffen er … næsten varm.',
    ],
  },

  missions: {
    hq: {
      title: 'Kælder-HQ',
      teaser: 'Opsnap en kodet besked, og følg sporet hele vejen til kureren.',
      progress: (n) => (n ? `${n} af 5 kapitler løst` : 'Klar til første briefing'),
    },
    vault: {
      title: 'Kodelåsen',
      teaser: 'Ti etager. Én nat. Hver dør har en kode.',
      progress: (floor) =>
        floor >= 10 ? 'Rekord: taget er nået!' : floor ? `Rekord: etage ${floor} af 10` : 'Klar til første nat',
    },
    mole: {
      title: 'Muldvarpen',
      teaser: 'Nogen har byttet bureauets filer ud. Find muldvarpen – helt uden stopur.',
      progress: (n) => (n ? `${n} af 4 kapitler opklaret` : 'Sporene venter'),
    },
    lab: {
      title: 'Gadget-laboratoriet',
      teaser: 'Saml dele på Mynthes værksted, og byg dit eget agentudstyr.',
      progress: (n) => (n ? `${n} af 6 gadgets bygget` : 'Værkstedet er åbent'),
    },
  },

  vault: {
    briefingSpeaker: 'Janni · bureauchef',
    briefing:
      'Kureren har gemt den stjålne harddisk i pengeskabet på toppen af Nordlystårnet. Ti etager, ti kodelåse og én vagt med lommelygte. Mynthe sender koderne som regnestykker – du taster svaret.',
    rules: [
      'Rigtig kode: døren glider op, og du klatrer en etage.',
      'Koden passer ikke: vagten går et skridt tættere på.',
      'Nå taget, før vagten når frem til dig.',
    ],
    start: 'Start natten',
    resume: (floor) => (floor ? `Fortsæt fra etage ${floor}` : 'Fortsæt natten'),
    restart: 'Start forfra',
    bestFloor: 'Rekord',
    bestFloorValue: (floor) => (floor >= 10 ? 'Taget!' : floor ? `Etage ${floor}` : '–'),
    bestTime: (level) => `Hurtigst til taget (${level})`,
    timerLabel: (seconds) => `Stopur på runden (${seconds} sek.)`,
    timerNone: 'På Let er der intet stopur – kun vagten.',
    hud: {
      pause: 'Pause',
      floor: 'Etage',
    },
    startLine: 'Jeg holder øje med vagten herfra. Kør!',
    resumeLine: 'Velkommen tilbage. Vagten har ikke opdaget noget.',
    floorLine: (floor) => (floor >= 10 ? 'Sidste dør! Du er på taget!' : `Døren glider op. Etage ${floor}!`),
    patrolLines: [
      'Vagten går et skridt. Ingen panik.',
      'Lommelygten drejer. Tag den med ro.',
      'Skridt på trappen … du har stadig forspring.',
      'Vagten gaber og går et skridt.',
      'Han stopper lige og binder snørebånd. Heldigt.',
    ],
    patrolNear: 'Vagten er tæt på nu. Én kode ad gangen.',
    result: {
      roof: {
        title: 'Taget er nået!',
        speaker: 'soeren',
        text: () => 'Svævebanen er spændt ud til nabohuset. Hop på – harddisken er i sikkerhed.',
      },
      caught: {
        title: 'Trukket ud i sikkerhed',
        speaker: 'frej',
        text: (floor) =>
          floor
            ? `Vagten kom lidt for tæt på, så jeg hev dig ud. Du nåede etage ${floor}. Sejt klaret.`
            : 'Vagten kom lidt for tæt på, så jeg hev dig ud. Næste nat kender du vejen.',
      },
      time: {
        title: 'Natten er forbi',
        speaker: 'soeren',
        text: (floor) =>
          floor ? `Solen står op, så vi kører hjem. Etage ${floor} står i logbogen.` : 'Solen står op, så vi kører hjem. I morgen nat er tårnet der stadig.',
      },
      floors: 'Etager',
      best: 'Personlig rekord',
      time: 'Tid til taget',
      newRecord: 'Ny rekord!',
      again: 'Ny nat',
      home: 'Tilbage til bureauet',
    },
  },

  missionSoon: {
    body: 'Jeg sætter lige de sidste ledninger i. Sagen åbner meget snart!',
  },

  agents: {
    title: 'Vælg agent',
    subtitle: 'Hvem tager den næste sag?',
    add: 'Ny agent',
  },

  newAgent: {
    eyebrowFirst: 'Ny rekrut',
    titleFirst: 'Velkommen til bureauet',
    introFirst: 'Du er netop blevet godkendt som bureauets yngste agent. Udfyld dit agentkort, så går vi i gang.',
    title: 'Ny agent',
    intro: 'Endnu en agent på holdet? Udfyld agentkortet.',
    defaultName: 'Vilde',
    nameLabel: 'Kodenavn',
    emblemLabel: 'Emblem',
    levelLabel: 'Sikkerhedsniveau',
    nameMissing: 'Skriv et kodenavn først.',
    submit: 'Aktivér agent',
  },

  parentGate: {
    eyebrow: 'Kun for chefer',
    title: 'Forældreadgang',
    intro: 'Tast svaret for at fortsætte.',
    retry: 'Ikke helt. Prøv igen.',
    close: 'Luk',
  },

  parent: {
    title: 'Forældreoversigt',
    soon: 'Oversigten med fremskridt, svage tabeller og backup bygges i et senere trin.',
  },

  shortcut: (a, b) => `Agent-genvej: ved du ${a} × ${b}, ved du også ${b} × ${a}.`,

  speakers: {
    vilde: 'Vilde',
    janni: 'Janni',
    soeren: 'Søren',
    frej: 'Frej',
    mynthe: 'Mynthe',
  },

  card: {
    confirm: 'OK',
    delete: 'Slet',
    next: 'Videre',
    emptyNudge: 'Tast et tal først, så sender jeg koden.',
    timeUp: 'Tiden løb fra os. Koden venter stadig – tag den med ro.',
    promptLabel: (q) =>
      q.type === 'missing'
        ? q.hidden === 'a'
          ? `Hvad gange ${q.b} giver ${q.product}?`
          : `${q.a} gange hvad giver ${q.product}?`
        : `Hvad er ${q.a} gange ${q.b}?`,
  },

  // First hint after a miss. Never gives the answer away.
  hints: {
    one: () => 'Gange 1 ændrer ingenting – tallet bliver bare sig selv.',
    ten: (n) => `Gange 10: sæt et 0 bag på ${n}.`,
    double: (n) => `Gange 2 er dobbelt op: ${n} + ${n}.`,
    half: (n, tenTimes) => `${n} × 10 = ${tenTimes}. Gange 5 er det halve.`,
    anchor: ({ n, f, A, anchorProduct, diff }) => {
      const amount = Math.abs(diff) === 1 ? `${n}` : `2 × ${n}`;
      return `${n} × ${A} = ${anchorProduct}, så ${n} × ${f} er ${amount} ${diff > 0 ? 'mere' : 'mindre'}.`;
    },
    skip: (step, numbers) => `Tæl med ${step} ad gangen: ${numbers.join(', ')} …`,
    missing: (step, product, numbers) =>
      `Tæl med ${step} ad gangen, til du rammer ${product}: ${numbers.join(', ')} … Hvor mange spring?`,
  },

  // After the second miss: show the answer plainly and move on.
  reveal: {
    product: (a, b, product, step, numbers) => `${a} × ${b} = ${product}. Tæl med ${step}: ${numbers.join(', ')}.`,
    missing: (a, b, product, step, numbers, jumps) =>
      `${a} × ${b} = ${product}. Tæl med ${step}: ${numbers.join(', ')} – det er ${jumps} spring.`,
    outro: 'Den kommer igen om lidt, så sidder den.',
  },

  // Rotated so nothing repeats within a session. Lines can be functions of the question.
  praise: {
    frej: [
      'Okay, okay. Den var faktisk ret hurtig.',
      'Jeg ville have klaret den … næsten lige så hurtigt. *gumle gumle*',
      'Hvem har lært dig det? Nå ja. Det har jeg nok.',
      'Skudsikker kode. Må jeg få resten af dine chips?',
      'Du gør mig arbejdsløs herude i vognen.',
      'Imponerende. Sig det ikke til nogen, at jeg sagde det.',
      (q) => `${q.a} × ${q.b}? Klaret, før jeg nåede at pakke min sandwich ud.`,
      'Fint nok, du er god. Bliv nu ikke høj i hatten.',
    ],
    mynthe: [
      'JA! Signalet er knivskarpt!',
      'Wow, din reaktionstid skal have sin egen graf.',
      'Perfekt input! Min dekoder lavede en lille glædesdans.',
      (q) => `${q.product}! Det tal fortjener en plakat på mit værksted.`,
      'Korrekt! Jeg har lige opgraderet dig i mit hoved. Agent version 2.0.',
      'Bing! Låsen har aldrig været så glad for at blive åbnet.',
      'Du er hurtigere end min nye processor. Det er lidt irriterende. Og mega fedt.',
      'Den sad! Fem virtuelle high fives, sendt nu.',
    ],
    soeren: [
      'Korrekt. Jeg skriver det i logbogen. Med stjerne.',
      'Fint arbejde. Vognen holder klar, ingen grund til panik.',
      'Rigtigt. Det var også præcis det, jeg ville have sagt.',
      'Pænt. Jeg er ved at løbe tør for ting at hjælpe med.',
      'Rigtigt. Så kan jeg lige nå at drikke min kaffe, mens den er varm.',
      (q) => `${q.a} × ${q.b} = ${q.product}. Rolig og præcis. Sådan.`,
      'Godt. Jeg hæver dit kaffebudget. Nå nej, du drikker kakao.',
      'Korrekt. Hvis nogen spørger, har du lært det af mig.',
    ],
    janni: [
      'Præcis. Det er derfor, du er på holdet.',
      'Flot, agent. Rolig hånd, klart hoved.',
      'Rigtigt. Jeg vidste, du havde den.',
      'Sådan. Bureauet er stolt af dig – og det er jeg også.',
      (q) => `${q.product}. Helt korrekt. Noteret i din sagsmappe.`,
      'Godt set. Du tænker som en rigtig agent.',
      'Korrekt. Hold det tempo, så er vi hjemme før aftensmad.',
      'Flot. Den slags præcision kan man ikke lære på et kursus.',
    ],
  },
};

export default strings;
