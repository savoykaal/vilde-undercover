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

  lab: {
    speaker: 'Mynthe · tekniker',
    briefings: [
      'Velkommen på værkstedet! Hver rigtig kode giver en ny del. Rør ikke loddekolben.',
      'Jeg har tegnet seks gadgets. Du skaffer delene, jeg skaffer … kakao.',
      'Fem minutter er nok til et par dele. Kom og gå, som du vil.',
      'Frej spurgte, om jeg kunne bygge en sandwich-drone. Svaret er nej. Indtil videre.',
    ],
    allBuilt: 'Alle seks gadgets står på hylden. Du er officielt min yndlingsassistent.',
    onBench: 'På bordet',
    collect: 'Saml dele',
    partsCount: (got, total) => `${got} af ${total} dele`,
    shelf: 'Hylden',
    shelfCount: (n) => `${n} af 6 bygget`,
    chooseHint: 'Tryk på en tom plads på hylden for at lægge en anden tegning på bordet.',
    built: 'Bygget',
    solvedStamp: 'Løst',
    resumeMission: (title, step) => `Fortsæt «${title}» · trin ${step + 1} af 5`,
    narrator: 'Mission',
    workshop: 'Værkstedet',
    hud: {
      pause: 'Pause',
      parts: 'Dele',
      step: 'Trin',
    },
    collectStart: 'Kom med koderne, så lodder jeg.',
    partLines: [
      (part) => `Ny del: ${part}!`,
      (part) => `${part} – check!`,
      (part) => `Så fik vi ${part}. Perfekt.`,
      (part) => `${part} sidder, hvor den skal.`,
    ],
    partSetbacks: [
      'Den del skal lige loddes en gang til.',
      'Skruen sad lidt skævt. Vi prøver igen.',
      'Loddekolben skal lige varmes op igen.',
    ],
    builtEyebrow: 'Ny gadget',
    builtLine: (name) => `${name} er færdig, og den virker! Skal vi prøve den af?`,
    gadgetEyebrow: 'Fra hylden',
    missionEyebrow: 'Mikromission',
    startMission: 'Start mikromission',
    resumeMissionButton: 'Fortsæt mikromission',
    replayMission: 'Spil den igen',
    backToLab: 'Tilbage til værkstedet',
    missionSolved: 'Mission løst!',

    gadgets: {
      hook: {
        name: 'Gribekrog',
        desc: 'Skyder en krog 30 meter op. Holder til én agent og én rygsæk.',
        parts: ['titaniumkrogen', 'superlinen', 'affyringsgrebet', 'trykpatronen'],
        mission: {
          title: 'Nøglerne på skorstenen',
          intro: { speaker: 'frej', text: 'En skade har tabt vognens nøgler på en skorsten. Søren er ikke glad.' },
          beats: [
            'Du sigter mod tagrenden og skyder. Krogen sidder fast.',
            'Du klatrer det første stykke. Frej holder vejret.',
            'Skaden kigger surt på dig. Den ville gerne beholde nøglerne.',
            'Du når skorstenen og griber nøglerne.',
            'Du firer dig ned igen. Blødt landet!',
          ],
          setbacks: ['Krogen glider lidt. Sigt igen.', 'Et vindstød får rebet til at svinge. Hold fast.', 'Skaden skræpper. Tag den med ro.'],
          outro: { speaker: 'soeren', text: 'Nøglerne er tilbage. Jeg lover aldrig mere at lade vinduet stå åbent i vognen.' },
        },
      },
      voice: {
        name: 'Stemmeforvrænger',
        desc: 'Få din stemme til at lyde som hvem som helst. Også som en meget gammel pirat.',
        parts: ['mikrofonen', 'lydchippen', 'højttaleren', 'batteriet'],
        mission: {
          title: 'Telefonfælden',
          intro: { speaker: 'janni', text: 'Ring til kureren som hans chef, Ulven, og find mødestedet.' },
          beats: [
            'Du stiller forvrængeren på "dyb og mystisk". Det ringer.',
            '"Ja, chef?" siger kureren. Det virker!',
            'Du spørger efter mødestedet. Han tøver …',
            '"Havnen, lagerhal 7, klokken 22," hvisker han.',
            'Du lægger på, før han når at undre sig.',
          ],
          setbacks: ['Forvrængeren knaser lidt. Prøv igen.', 'Kureren hoster. Han har ikke opdaget noget.'],
          outro: { speaker: 'mynthe', text: 'Han opdagede INTET. Min forvrænger er et mesterværk. Og du er også ret god.' },
        },
      },
      shoes: {
        name: 'Lydløse sko',
        desc: 'Gå hen over et knirkende trægulv uden en lyd. Selv i Frejs værelse.',
        parts: ['skumsålerne', 'støjdæmperen', 'gummihælene', 'snørebåndene', 'stilleknappen'],
        mission: {
          title: 'Museets knirkegulv',
          intro: { speaker: 'janni', text: 'Mikrofilmen er på museet – lige ved vagthunden Bamse, som sover.' },
          beats: [
            'Du tager skoene på. Første skridt: ingen lyd.',
            'Gulvet er ældgammelt. Skoene tager hvert eneste knirk.',
            'Bamse snorker og vender sig. Du står helt stille.',
            'Du løfter glasset og tager mikrofilmen.',
            'Du lister tilbage. Bamse sover stadig sødt.',
          ],
          setbacks: ['Bamse løfter et øre … og sover videre.', 'Et gulvbræt overvejer at knirke. Tag det roligt.'],
          outro: { speaker: 'frej', text: 'Du var så stille, at jeg troede, mikrofonen var gået i stykker. Respekt.' },
        },
      },
      smoke: {
        name: 'Røgpen',
        desc: 'Ligner en helt almindelig kuglepen. Tre klik, og rummet fyldes med tåge.',
        parts: ['pennehuset', 'røgkapslen', 'klikmekanismen', 'filteret', 'hætten'],
        mission: {
          title: 'Laserkorridoren',
          intro: { speaker: 'mynthe', text: 'Gangen er fuld af usynlige lasere. Røg gør dem synlige!' },
          beats: [
            'Klik, klik, klik. Røgen breder sig, og røde stråler dukker op.',
            'Du kravler under den første stråle.',
            'Du træder over den næste. Præcis som til træning.',
            'En stråle blinker hurtigt. Du venter på det rette øjeblik.',
            'Du er igennem! Døren for enden står åben.',
          ],
          setbacks: ['Røgen driver væk. Klik igen.', 'En stråle flytter sig. Vent et øjeblik.'],
          outro: { speaker: 'janni', text: 'Ingen alarmer. Ingen spor. Kun lidt røg, der dufter af vanilje.' },
        },
      },
      gloves: {
        name: 'Magnetiske handsker',
        desc: 'Klatr op ad en metalvæg, eller hent en nøgle gennem et gitter.',
        parts: ['magnetpladerne', 'kobberspolen', 'handskestoffet', 'strømknappen', 'batteripakken', 'sikkerhedslåsen'],
        mission: {
          title: 'Kortet i skakten',
          intro: { speaker: 'soeren', text: 'Frej tabte nøglekortet ned i ventilationen. Selvfølgelig.' },
          beats: [
            'Du tænder handskerne. De summer svagt.',
            'Du holder hånden over gitteret. Noget rasler dernede.',
            'Et gammelt søm hopper op først. Ikke det, vi leder efter.',
            'Så klikker nøglekortet fast i handsken.',
            'Du trækker det op gennem gitteret. Rent og tørt.',
          ],
          setbacks: ['Kortet glider af igen. Prøv en gang til.', 'Handskerne summer lidt svagt. Giv dem et øjeblik.'],
          outro: { speaker: 'frej', text: 'Okay, okay. Jeg skylder dig. Du må få min sidste chokoladebar. Den halve.' },
        },
      },
      drone: {
        name: 'Mini-drone',
        desc: 'Lydløs, lille som en spurv og med et kamera, der kan se i mørke.',
        parts: ['propellerne', 'motoren', 'kameraet', 'styrekortet', 'batteriet', 'antennen'],
        mission: {
          title: 'Øjet i himlen',
          intro: { speaker: 'janni', text: 'Kureren kører fra havnen. Følg bilen, og se hvor filen ender.' },
          beats: [
            'Dronen letter lydløst fra din hånd.',
            'Du finder den sorte bil ved rundkørslen.',
            'Bilen drejer ned ad en smal gade. Du følger efter over tagene.',
            'Den stopper ved et gammelt bageri. Mistænkeligt.',
            'Kameraet zoomer ind: Kureren gemmer filen i en kagekasse!',
          ],
          setbacks: ['En due flyver forbi. Dronen svinger udenom.', 'Signalet flimrer. Hold kursen.'],
          outro: { speaker: 'mynthe', text: 'Vi har ham! Og nu ved vi også, hvor de laver byens bedste kanelsnegle.' },
        },
      },
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
