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
    eyebrow: 'Sag 02 · Nordlystårnet',
    briefingSpeaker: 'Janni · bureauchef',
    briefing:
      'Kureren har gemt den stjålne harddisk i pengeskabet på toppen af Nordlystårnet. Ti etager, ti kodelåse og vagter på hver etage. Mynthe sender koderne som regnestykker – du taster svaret.',
    rules: [
      'Snig dig forbi vagterne til døren øverst på hver etage.',
      'Svaret på regnestykket er koden. Rigtig kode: døren glider op.',
      'Passer koden ikke, eller ser en vagt dig, stiger alarmen et trin.',
      'Nå taget, før alarmen er fuld.',
    ],
    start: 'Start natten',
    resume: (floor) => (floor ? `Fortsæt fra etage ${floor + 1}` : 'Fortsæt natten'),
    restart: 'Start forfra',
    bestFloor: 'Rekord',
    bestFloorValue: (floor) => (floor >= 10 ? 'Taget!' : floor ? `Etage ${floor}` : '–'),
    bestTime: (level) => `Hurtigst til taget (${level})`,
    timerLabel: (minutes) => `Stopur på natten (${minutes} min.)`,
    timerNone: 'På Let er der intet stopur – kun alarmen.',
    floorLabel: (n) => `Etage ${n}`,
    keypadHint: 'Regn svaret ud – det er koden til døren.',
    goals: {
      door: (n) => `Etage ${n}: Snig dig hen til kodelåsen`,
      up: 'Løb op ad trappen',
    },
    alarm: (n, total) => `Alarm ${n}/${total}`,
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
      timeLabel: 'Tid til taget',
      newRecord: 'Ny rekord!',
      again: 'Ny nat',
      home: 'Tilbage til bureauet',
    },
  },

  mole: {
    chapterOf: (n) => `Muldvarpen · kapitel ${n} af 4`,
    evidence: 'Beviser',
    clues: {
      photo: { clear: (v) => `Trøjen er ${v}!` },
      shoe: { clear: (v) => `Skostørrelse ${v}!` },
      phone: { clear: (v) => `Nummeret slutter på ${v}!` },
    },
    colors: { roed: 'rød', blaa: 'blå' },
    attributes: { photo: 'Trøje', shoe: 'Sko', phone: 'Telefon' },
    attrValue: {
      photo: (v) => ({ roed: 'Rød', blaa: 'Blå' })[v],
      shoe: (v) => `Str. ${v}`,
      phone: (v) => `…${v}`,
    },
    ruledOut: 'Udelukket',
    accuseQuestion: (name) => `Anklag ${name}?`,
    accuse: 'Anklag',
    digDeeper: 'Grav videre',
    mismatch: {
      photo: (name, evidence, own) => `Personen på fotoet har ${evidence} trøje, men ${name} har ${own}.`,
      shoe: (name, evidence, own) => `Skoaftrykket er str. ${evidence}, men ${name} bruger str. ${own}.`,
      phone: (name, evidence, own) => `Nummeret slutter på ${evidence}, men ${name}s telefon slutter på ${own}.`,
    },
    revealTitle: (name) => `Det var ${name}!`,

    suspects: {
      holm: { name: 'Bente Holm', short: 'Holm', role: 'Arkivar', about: 'Har passet arkivet i 30 år. Løser krydsord i frokostpausen.' },
      kasper: { name: 'Kasper Lund', short: 'Kasper', role: 'Pedel', about: 'Har nøgler til alle døre. Fløjter altid den samme sang.' },
      nora: { name: 'Nora Vinther', short: 'Nora', role: 'Praktikant', about: 'Spiller basketball og har kæmpestore sneakers.' },
      ib: { name: 'Ib Mikkelsen', short: 'Ib', role: 'Postbud', about: 'Kommer med posten hver dag kl. 10. Elsker lakrids.' },
    },

    chapters: [
      {
        title: 'Kopirummet',
        teaser: 'En falsk mappe i kopimaskinen og et spor i tonerpulveret.',
        intro: [
          ['janni', 'Nogen har byttet tre af bureauets mapper ud med falske kopier. Vi har en muldvarp.'],
          ['mynthe', 'Kameraet i kopirummet fangede noget. Og der er et skoaftryk i tonerpulveret!'],
          ['soeren', 'Fire personer var i bygningen i går. Intet stopur her – vi tager det i ro og mag.'],
        ],
        resolution: [
          ['kasper', 'Okay, okay! Jeg byttede mapperne. En seddel lovede mig en hel lagkage, hvis jeg gjorde det.'],
          ['janni', 'En seddel? Fra hvem?'],
          ['kasper', 'Den var bare underskrevet "M". Og lagkagen kom aldrig.'],
          ['frej', 'M for Muldvarpen. Og for Meget Nærig.'],
        ],
      },
      {
        title: 'Postrummet',
        teaser: 'Falske breve, kakao på gulvet og et mystisk opkald.',
        intro: [
          ['janni', 'Nye falske mapper – denne gang i postrummet. Muldvarpen har fået en ny hjælper.'],
          ['frej', 'Nogen har spildt kakao på gulvet og trådt lige i den. Klassisk.'],
          ['mynthe', 'Og nogen har ringet fra en telefon i postrummet. Jeg kan gendanne nummeret.'],
        ],
        resolution: [
          ['ib', 'Jeg troede, det var helt almindelig post! Pakken var fra "M" – med en pose lakrids som tak.'],
          ['soeren', 'Lakrids. Muldvarpen kender sine folk.'],
          ['janni', 'Muldvarpen lader andre gøre arbejdet. Vi må komme tættere på.'],
        ],
      },
      {
        title: 'Kantinen',
        teaser: 'En mappe under bakkerne og et kæmpe skoaftryk i ketchup.',
        intro: [
          ['janni', 'I kantinen lå en falsk mappe gemt under bakkerne. Nogen havde travlt.'],
          ['mynthe', 'Kameraet over kaffemaskinen fangede en ryg. Og kantinens telefon blev brugt kl. 12.03.'],
          ['frej', 'Og der er et kæmpe skoaftryk i ketchuppen. Hvem har så store fødder?'],
        ],
        resolution: [
          ['nora', 'Undskyld! En besked sagde, at det var en test for nye praktikanter. Jeg ville bare gøre det godt.'],
          ['janni', 'Det var ikke din skyld, Nora. Hvem sendte beskeden?'],
          ['nora', 'Den kom fra arkivets printer. Og kun én person har koden til den printer …'],
        ],
      },
      {
        title: 'Muldvarpen',
        teaser: 'Alle spor peger mod arkivet. Nu skal sandheden frem.',
        intro: [
          ['janni', 'Arkivets printer. Kun én person har koden. Men vi skal have beviser.'],
          ['soeren', 'Muldvarpen har været i arkivet i nat. Der ligger spor overalt.'],
          ['mynthe', 'Sidste sæt beviser. Fremkald dem, og så afslører vi Muldvarpen én gang for alle.'],
        ],
        resolution: [
          ['holm', 'I tredive år har ingen lagt mærke til mig. Jeg ville bare have, at nogen så, hvor klog jeg er.'],
          ['janni', 'Det har vi set nu. Men de ægte mapper skal tilbage på plads. Med det samme.'],
          ['frej', (name) => `Agent ${name} fangede Muldvarpen. Uden stopur. Uden panik. Jeg er … imponeret.`],
        ],
      },
    ],
  },

  lab: {
    eyebrow: 'Mynthes værksted',
    briefings: [
      'Velkommen på værkstedet! Hver gadgetdel, du finder i missionerne, kan jeg bygge noget sejt af.',
      'Jeg har tegnet seks gadgets. Du skaffer delene, jeg skaffer … kakao.',
      'Dele gemmer sig i hjørner og mørke kroge. Kig godt efter, når du er på mission.',
      'Frej spurgte, om jeg kunne bygge en sandwich-drone. Svaret er nej. Indtil videre.',
    ],
    allBuilt: 'Alle seks gadgets står på hylden. Du er officielt min yndlingsassistent.',
    freeParts: (n) => (n === 1 ? '1 ledig gadgetdel' : `${n} ledige gadgetdele`),
    foundTotal: (n) => `${n} fundet i alt`,
    whereParts: 'Gadgetdele ligger gemt i missionerne – de glimter lyserødt. Hver gadget giver dig en fordel i felten.',
    partsCount: (got, total) => `${got} af ${total} dele`,
    partsNeeded: (n) => `Kræver ${n} dele`,
    buildButton: 'Byg den!',
    built: 'Bygget',
    perkLabel: 'Fordel: ',
    perks: {
      hook: 'Tårnet får ét ekstra alarmtrin.',
      voice: 'Vagterne opdager dig lidt langsommere.',
      shoes: 'Du bevæger dig hurtigere.',
      smoke: 'Én gang pr. mission redder en røgsky dig, når du bliver opdaget.',
      gloves: 'Du samler dele og kort op på lidt længere afstand.',
      drone: 'Du ser længere i mørket.',
    },
    gadgets: {
      hook: {
        name: 'Gribekrog',
        desc: 'Skyder en krog 30 meter op. Holder til én agent og én rygsæk.',
        parts: ['titaniumkrogen', 'superlinen', 'affyringsgrebet', 'trykpatronen'],
        mission: {
          outro: { speaker: 'soeren', text: 'Nøglerne er tilbage. Jeg lover aldrig mere at lade vinduet stå åbent i vognen.' },
        },
      },
      voice: {
        name: 'Stemmeforvrænger',
        desc: 'Få din stemme til at lyde som hvem som helst. Også som en meget gammel pirat.',
        parts: ['mikrofonen', 'lydchippen', 'højttaleren', 'batteriet'],
        mission: {
          outro: { speaker: 'mynthe', text: 'Han opdagede INTET. Min forvrænger er et mesterværk. Og du er også ret god.' },
        },
      },
      shoes: {
        name: 'Lydløse sko',
        desc: 'Gå hen over et knirkende trægulv uden en lyd. Selv i Frejs værelse.',
        parts: ['skumsålerne', 'støjdæmperen', 'gummihælene', 'snørebåndene', 'stilleknappen'],
        mission: {
          outro: { speaker: 'frej', text: 'Du var så stille, at jeg troede, mikrofonen var gået i stykker. Respekt.' },
        },
      },
      smoke: {
        name: 'Røgpen',
        desc: 'Ligner en helt almindelig kuglepen. Tre klik, og rummet fyldes med tåge.',
        parts: ['pennehuset', 'røgkapslen', 'klikmekanismen', 'filteret', 'hætten'],
        mission: {
          outro: { speaker: 'janni', text: 'Ingen alarmer. Ingen spor. Kun lidt røg, der dufter af vanilje.' },
        },
      },
      gloves: {
        name: 'Magnetiske handsker',
        desc: 'Klatr op ad en metalvæg, eller hent en nøgle gennem et gitter.',
        parts: ['magnetpladerne', 'kobberspolen', 'handskestoffet', 'strømknappen', 'batteripakken', 'sikkerhedslåsen'],
        mission: {
          outro: { speaker: 'frej', text: 'Okay, okay. Jeg skylder dig. Du må få min sidste chokoladebar. Den halve.' },
        },
      },
      drone: {
        name: 'Mini-drone',
        desc: 'Lydløs, lille som en spurv og med et kamera, der kan se i mørke.',
        parts: ['propellerne', 'motoren', 'kameraet', 'styrekortet', 'batteriet', 'antennen'],
        mission: {
          outro: { speaker: 'mynthe', text: 'Vi har ham! Og nu ved vi også, hvor de laver byens bedste kanelsnegle.' },
        },
      },
    },
  },

  map: {
    open: 'Åbn',
    play: 'Start mission',
    resume: 'Fortsæt missionen',
    replay: 'Spil igen',
    close: 'Luk',
    locked: 'Forseglet. Løs sagen før denne for at åbne den.',
    mathNote: 'Her er regnestykkerne koden til hver dør.',
    readyToBuild: (name) => `Du har dele nok til at bygge ${name}!`,
    clearanceNote: 'Sikkerhedsniveauet styrer regnestykkerne og hvor skarpe vagterne er.',
    nextLine: (title) => `Næste sag: «${title}». Tryk på den lyserøde nål.`,
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

  game: {
    hud: {
      pause: 'Pause',
      moveHint: 'Træk med tommelfingeren for at gå',
      spotted: 'Opdaget!',
      locked: 'Låst',
      needCard: 'Kræver et adgangskort',
      part: '+1 gadgetdel',
      partAgain: 'Den har du allerede fundet',
      partsLabel: 'Gadgetdele fundet',
      smoke: 'Røgpen!',
      smokeLine: 'Puf! Røgpennen reddede dig. Den virker kun én gang pr. mission – så pas på nu.',
    },
    actions: {
      use: 'Brug',
      hide: 'Gem dig',
      unhide: 'Kom frem',
      radio: 'Radio',
      codebook: 'Kodebog',
      keypad: 'Kodelås',
      terminal: 'Hack',
      wires: 'Ledninger',
      safe: 'Pengeskab',
      drawer: 'Dirk',
      fusebox: 'Sikringer',
      lever: 'Træk',
      phone: 'Telefon',
      photo: 'Foto',
      print: 'Spor',
      board: 'Tavle',
      scanner: 'Scanner',
      talk: 'Snak',
      take: 'Tag',
      riddle: 'Svar',
      alarm: 'Alarm',
    },
    intro: {
      start: 'Start mission',
      resume: 'Fortsæt',
      restart: 'Start forfra',
      back: 'Tilbage til kortet',
    },
    pause: {
      title: 'Pause',
      resume: 'Fortsæt',
      soundOn: 'Lyd: til',
      soundOff: 'Lyd: fra',
      restart: 'Start banen forfra',
      quit: 'Til kortet',
    },
    done: {
      title: 'Mission fuldført',
      stamp: 'Løst',
      stars: { done: 'Missionen løst', parts: 'Alle gadgetdele fundet', ghost: 'Aldrig opdaget' },
      newStar: 'Ny stjerne!',
      next: 'Næste mission',
      map: 'Til kortet',
      again: 'Spil igen',
      parts: (got, total) => `Gadgetdele: ${got} af ${total}`,
      caught: (n) => (n === 0 ? 'Ingen så dig. Ægte skyggeagent.' : n === 1 ? 'Opdaget én gang – men du kom igennem.' : `Opdaget ${n} gange – men du gav ikke op.`),
    },
    caughtLines: [
      ['soeren', 'Puha. Jeg distraherede vagten med en kanelsnegl. Prøv igen herfra.'],
      ['frej', 'Tæt på! Jeg hev dig lige tilbage. Ingen skade sket.'],
      ['mynthe', 'Jeg har spolet overvågningen tilbage. Du er usynlig igen. Prøv en anden vej.'],
      ['janni', 'Rolig, agent. Vent på det rigtige øjeblik, og prøv igen.'],
      ['soeren', 'Ingen panik. Vagten tror, det var en kat. Igen.'],
      ['frej', 'Han så dig næsten! Prøv at snige dig bag om ham.'],
      ['mynthe', 'Tip: Kig på lyskeglen. Hvor den ikke rammer, kan han ikke se dig.'],
    ],
    mg: {
      close: 'Luk',
      solved: 'Klaret!',
      keypad: {
        title: 'Kodelås',
        hint: 'Hvert rigtigt svar er en del af koden.',
        progress: (n, total) => `Kode ${n} af ${total}`,
        open: 'Klik! Låsen er åben.',
      },
      wires: {
        title: 'Ledninger',
        hint: 'Træk hver ledning hen til stikket med samme farve og tegn.',
        wrong: 'Gnist! Den passer ikke. Prøv et andet stik.',
      },
      tuner: {
        title: 'Find signalet',
        hint: 'Træk knappen, til din bølge passer med den stiplede.',
        far: 'Kun støj …',
        near: 'Der er noget! Lidt mere …',
        locking: 'Hold den der …',
        lock: 'Signal fundet!',
      },
      cipher: {
        title: 'Knæk koden',
        hint: 'Drej hjulet, til bogstaverne danner et rigtigt ord.',
        word: (i, n) => `Ord ${i} af ${n}`,
        gotWord: (w) => `${w}!`,
      },
      safe: {
        title: 'Pengeskabet',
        hint: 'Drej hjulet langsomt med fingeren. Når lyttemåleren er fuld, så stop og hold stille.',
        listen: 'Lyttemåler',
        number: (i, n) => `Tal ${i} af ${n}`,
        got: 'Klik! Tallet sidder.',
        open: 'Pengeskabet er åbent!',
      },
      lockpick: {
        title: 'Dirk låsen',
        hint: 'Tryk, når stiften lyser grønt.',
        button: 'Lås stiften',
        early: 'Lidt for tidligt …',
        late: 'Lidt for sent …',
        set: 'Stiften sidder!',
        open: 'Låsen giver sig!',
      },
      hack: {
        title: 'Hack systemet',
        hint: 'Tryk på brikkerne for at dreje dem. Led strømmen fra venstre til højre.',
      },
      simon: {
        title: 'Husk tonerne',
        hint: 'Se og lyt – og tryk så i samme rækkefølge.',
        watch: 'Se godt efter …',
        go: 'Din tur!',
        again: 'Ikke helt. Vi tager den igen.',
        nice: 'Flot! En til.',
        round: (n, total) => `Runde ${n} af ${total}`,
        done: 'Alle toner sidder!',
      },
      riddle: {
        title: 'Gåden',
        wrong: 'Hmm … prøv et andet svar.',
        right: 'Rigtigt!',
        solved: 'Alle gåder er løst!',
        progress: (n, total) => `Gåde ${n} af ${total}`,
      },
      dust: {
        title: 'Fremkald sporet',
        hint: 'Gnid med fingeren for at børste støvet væk.',
      },
      photo: {
        title: 'Ret billedet op',
        hint: 'Tryk på brikkerne for at dreje dem på plads.',
      },
      deduce: {
        title: 'Deduktionstavlen',
        hint: 'Hvem passer med alle tre beviser? Tryk på personen.',
      },
      assemble: {
        title: 'Byg gadgetten',
        hint: 'Træk delene hen på de lysende pladser på tegningen.',
        built: (name) => `${name} er færdig!`,
      },
    },
  },

  // Copy for each playable level. Lines are [speaker, text]; text can be a function of the agent's name.
  levels: {
    c1: {
      teaser: 'Opsnap og knæk en hemmelig besked.',
      eyebrow: 'Kapitel 1 · Kælder-HQ',
      title: 'Den kodede besked',
      briefSpeaker: 'janni',
      brief: 'Godmorgen, agent. I nat forsvandt Nordlys-filen fra bureauets arkiv. Tyven sender beskeder i kode – og vi har lige opsnappet én.',
      tips: ['Træk med tommelfingeren for at gå.', 'Den store knap bruger ting, når du står ved dem.', 'Følg den lyserøde pil.'],
      goals: {
        mynthe: 'Gå hen til Mynthe',
        radio: 'Find signalet på radioen',
        sneak: 'Snig dig forbi Frej til Jannis kontor',
        codebook: 'Knæk koden med kodebogen',
        keypad: 'Knæk tallåsen',
        exit: 'Gå op til vognen',
      },
      lines: {
        start: [['mynthe', 'Hey, agent! Kom herover til mit værksted. Jeg har fanget noget på radioen.']],
        radioDone: [
          ['mynthe', 'Beskeden er fuld af kode. Det er så nørdet. Jeg ELSKER det.'],
          ['mynthe', 'Kodebogen ligger på Jannis skrivebord – på den anden side af Frejs træningsbane.'],
        ],
        sneak: [
          ['frej', 'Jeg er vagten i dag. Hvis min lygte rammer dig, skylder du mig chips.'],
          ['soeren', 'Hold dig ude af lyskeglen. Bliver det for varmt, så gem dig i en kasse.'],
        ],
        office: [['janni', 'Flot sneget. Kodebogen ligger på skrivebordet til venstre.']],
        codebookDone: [
          ['mynthe', 'KURER og TORVEGADE! Beskeden handler om en kurer.'],
          ['mynthe', 'Vent. Beskeden fortsætter – nu med tal! Tallåsen står til højre.'],
        ],
        keypadDone: [
          ['mynthe', '15 og 30. Klokken halv fire!'],
          ['janni', 'Torvegade, klokken 15.30. Og kureren går med grå hat. Flot arbejde, agent.'],
        ],
        exit: [['frej', 'En grå hat? Hvem går med grå hat i dag? Det bliver let. Jeg venter i vognen.']],
      },
      talk: {
        mynthe: ['Radioen er lige der. Træk knappen, til bølgerne passer.', 'Jeg har lodret hele natten. Det var det værd.'],
        soeren: ['Kakaoen er varm. Missionen først, så kakao.', 'Jeg har tanket vognen. Vi kører, når du er klar.'],
        janni: ['Kodebogen til venstre, tallåsen til højre. Du klarer det.', 'Rolig hånd, klart hoved.'],
      },
      caught: 'Fanget! Du skylder mig chips. Prøv igen – jeg lukker øjnene … næsten.',
      keypadHint: 'Tallåsen vil have to tal. Regn dem ud, og tast dem ind.',
      done: [
        ['janni', 'Torvegade, klokken 15.30, en kurer med grå hat. Flot arbejde, agent.'],
        ['soeren', 'Pak madpakken. Vi skal ud.'],
      ],
    },
    c2: {
      teaser: 'Følg manden med den grå hat gennem byen.',
      eyebrow: 'Kapitel 2 · Torvegade',
      title: 'Skygge i byen',
      briefSpeaker: 'soeren',
      brief: 'Klokken er 15.29. Manden med den grå hat går lige foran dig. Hold afstand – tre meter bag ham. Aldrig to.',
      tips: [
        'Hold dig tæt nok til ikke at miste ham – men ikke for tæt.',
        'Når han stopper og kigger sig tilbage, så gem dig bag et træ, en bil eller i en busk.',
        'Afstandsmåleren øverst viser, om du følger ham godt.',
      ],
      goals: {
        follow: 'Følg manden med den grå hat',
        square: 'Hold øje med ham på torvet',
        swap: 'Hvad sker der?',
        bag: 'Følg den sorte taske!',
      },
      meter: {
        good: 'Afstand: perfekt',
        near: 'For tæt på!',
        far: 'Du er ved at miste ham!',
      },
      lines: {
        start: [
          ['mynthe', 'Jeg følger dig på GPS. Han går mod havnen.'],
          ['frej', 'Og spis ikke isen for hurtigt. Jeg fik hjernefrysning midt i en skygning engang.'],
        ],
        twist: [
          ['frej', 'Øh … der er TO grå hatte nu. Han har mødt en anden fyr med grå hat!'],
          ['mynthe', 'De bytter tasker! Se godt efter!'],
        ],
        bag: [
          ['janni', 'Følg tasken, agent. Ikke hatten. Den sorte taske går mod parken.'],
        ],
        done: [
          ['mynthe', 'Han gik ind hos Vestergaard Arkiver. Syvende sal er lukket for alle – selv for rengøringen.'],
          ['soeren', (name) => `Så er det dér, filen er. Godt skygget, ${name}.`],
        ],
      },
      spotted: 'Han kiggede lige på dig! Vi prøver igen – og husk at gemme dig, når han vender sig.',
      lost: 'Vi mistede ham. Hold dig lidt tættere på denne gang.',
      tooClose: 'Hov, du var så tæt på, at du næsten kunne læse hans indkøbsseddel. Lidt mere afstand.',
      wrongHat: 'Du følger hatten – ikke tasken! Den sorte taske er hos den anden mand.',
      done: [
        ['mynthe', 'Vestergaard Arkiver. Syvende sal er lukket for alle – selv for rengøringen.'],
        ['frej', 'Hvad skete der med isen? Gav du den til en due? Legendarisk.'],
      ],
    },
    c3: {
      teaser: 'Kom forbi kort, fingeraftryk og en vagt med kaffe.',
      eyebrow: 'Kapitel 3 · Vestergaard Arkiver',
      title: 'Syvende sal',
      briefSpeaker: 'janni',
      brief: 'Syvende sal kræver adgangskort, fingeraftryk og en kode. Mynthe har kopieret kortet. Resten er op til dig.',
      tips: [
        'Vagternes lyskegler viser, hvad de kan se. Vent, til de vender ryggen til.',
        'Skabe kan du gemme dig i, hvis det brænder på.',
        'Laserne blinker i takt. Løb, når de slukker.',
      ],
      card: 'Adgangskort',
      goals: {
        card: 'Brug adgangskortet på døren',
        hack: 'Hack kameraet fra serverrummet',
        office: 'Snig dig gennem kontoret',
        lasers: 'Kom forbi laserne til scanneren',
        hide: 'Ind i kopirummet – nu!',
        keypad: 'Knæk koden til bagdøren',
        exit: 'Smut ind i arkivet',
      },
      lines: {
        start: [
          ['soeren', 'Jeg har lånt en rengøringsvogn. Du er nu praktikant. Smil.'],
          ['mynthe', 'Kortet er kopieret. Gå hen til døren, så klarer kortlæseren resten.'],
        ],
        camera: [
          ['mynthe', 'Kortlæseren blinker grønt! Men pas på – der hænger et kamera i gangen.'],
          ['mynthe', 'Smut ind i serverrummet til venstre. Derfra kan vi hacke kameraet.'],
        ],
        hacked: [['mynthe', 'Kameraet viser nu en video af en kat. Klassiker.']],
        office: [
          ['frej', 'To vagter i kontoret. De går frem og tilbage som to robotter.'],
          ['soeren', 'Brug skillevæggene som skjul. Vent, og gå, når de vender om.'],
        ],
        lasers: [['mynthe', 'Laserne blinker i takt. Vent, til de slukker – og løb! Scanneren sidder ved døren.']],
        scanned: [['mynthe', 'Scanneren tror nu, at du er direktøren. Og laserne er slukket. Du er god!']],
        twist: [
          ['frej', 'Stop! En vagt er på vej op ad trappen. Han har en KAFFEKOP.'],
          ['soeren', 'Ind i kopirummet. Nu. Mens han kigger den anden vej.'],
        ],
        copyRoom: [['mynthe', 'Han går først, når kaffen er drukket. Knæk koden til bagdøren imens!']],
        open: [['mynthe', 'Klik! Bagdøren glider op. Arkivet venter.']],
      },
      coffeeCaught: 'Puha! Han så dig – men han spildte kaffe på skoene og løb ud efter servietter. Prøv igen.',
      scannerHint: 'Kobl scannerens ledninger om, så den tror, du er direktøren.',
      keypadHint: 'Kodelåsen har tre dele. Hvert rigtigt svar er én af dem.',
      done: [
        ['mynthe', 'Du er inde! Arkivet har tusind skuffer. Én af dem gemmer filen.'],
        ['frej', 'Kaffevagten opdagede ingenting. Han så bare katten.'],
      ],
    },
    c4: {
      teaser: 'Tusind skuffer. Én fil. Et signal, der bipper.',
      eyebrow: 'Kapitel 4 · Arkivet',
      title: 'Den stjålne fil',
      briefSpeaker: 'mynthe',
      brief: 'Tusind skuffer, én fil. Filen sender et svagt signal. Jo tættere du kommer, jo hurtigere bipper min scanner.',
      tips: [
        'Her er mørkt. Signalmåleren øverst viser, om du er varm eller kold.',
        'Vagternes lommelygter kan du se på lang afstand. Brug det.',
        'Ved pengeskabet: drej langsomt, og stop, når lyttemåleren er fuld.',
      ],
      signal: 'Signal',
      card: 'Nøglekort',
      cardFound: 'Nøglekortet!',
      goals: {
        signal: 'Følg signalet til Nordlys-filen',
        drawer: 'Dirk skuffe G-42 op',
        card: 'Hent nøglekortet i vagtstuen',
        office: 'Åbn direktørens kontor',
        safe: 'Knæk pengeskabet',
        exit: 'Kom ud af arkivet',
      },
      lines: {
        start: [
          ['mynthe', 'Bip … bip. Signalet er svagt. Gå rundt, og lyt efter, når det bipper hurtigere.'],
          ['frej', 'Og du må ikke tage noget andet med. Heller ikke den flotte kuglepen. Jeg kan se dig.'],
        ],
        empty: [
          ['mynthe', 'Vent … scanneren bipper stadig. Mappen er TOM. Den er en attrap!'],
          ['soeren', 'Så har de flyttet den ægte fil. Men attrappen har en chip i ryggen.'],
          ['mynthe', 'Chippen peger på pengeskabet i direktørens kontor. Døren er låst – nøglekortet ligger i vagtstuen.'],
          ['frej', 'Og nu går der TO vagter rundt. Hurtigt, men stille.'],
        ],
        gotCard: [['mynthe', 'Kortet er dit! Direktørens kontor er oppe til venstre.']],
        safe: [['mynthe', 'Pengeskabet har et gammelt drejehjul. Lyt efter klikket.']],
        file: [['janni', 'Den ægte Nordlys-fil ligger indenfor. Jeg er virkelig stolt af dig.']],
        out: [['soeren', 'Kom ned til bagdøren. Vognen holder klar.']],
      },
      breakCaught: 'Vagten i vagtstuen kiggede op fra sit krydsord. Vent, til han kigger den anden vej.',
      done: [
        ['frej', 'Det var dig, der gjorde det. Men jeg passede vognen. Meget vigtigt job.'],
        ['mynthe', 'Chippen afslører én ting mere: Kureren skal hente filen i aften. På havnen.'],
      ],
    },
    c5: {
      teaser: 'Mød kureren på havnen i tågen.',
      eyebrow: 'Kapitel 5 · Havnen',
      title: 'Kureren',
      briefSpeaker: 'janni',
      brief: 'I aften kommer kureren til havnen for at hente filen. Men filen er hos os. Vi har stillet en kuffert på bænken – med noget helt andet i.',
      tips: [
        'Tågen gør det svært at se langt. Det gælder også for kurerens hjælpere.',
        'Snig dig op til udkigsposten mellem containerne.',
        'Når det gælder: du er hurtigere end kureren.',
      ],
      riddleTitle: 'Kurerens gåder',
      gotcha: 'Fanget!',
      goals: {
        yard: 'Snig dig op til udkigsposten',
        watch: 'Hold øje med båden',
        talk: 'Hold ham snakkende – svar på hans gåder',
        chase: 'Fang kureren!',
        caught: 'Konfetti!',
      },
      lines: {
        start: [
          ['soeren', 'Havnen, lagerhal 7. Tåge over vandet. Kureren har hjælpere med lommelygter.'],
          ['mynthe', 'Kufferten har en sporingschip, en alarm og … konfetti. Det var Frejs idé.'],
          ['frej', 'Man skal have lidt stil.'],
        ],
        boat: [['frej', 'En båd lægger til. Grå hat. Det er kureren.']],
        twist: [
          ['frej', 'Øh. Han tager ikke kufferten. Han kigger direkte på DIG.'],
          ['kureren', 'Jeg vidste, at bureauet ville sende nogen. Men så ung en agent? Seriøst?'],
          ['janni', 'Hun er vores bedste agent. Hold ham snakkende, så kommer vi.'],
          ['kureren', 'Hvis du er så klog, så svar på mine gåder!'],
        ],
        lightsOut: [
          ['mynthe', 'Nu! Jeg slukker lyset på havnen.'],
          ['soeren', 'Og jeg tænder billygterne. Han løber – fang ham!'],
        ],
        caught: [
          ['kureren', 'Konfetti? KONFETTI? Det her er det mest pinlige øjeblik i hele min karriere.'],
          ['frej', 'Han løb lige ind i mig. Og i konfettien. Legendarisk.'],
        ],
      },
      talk: {
        frej: ['Jeg passer vognen. Og snacksene.', 'Sig til, hvis du får brug for muskler. Eller chips.'],
        soeren: ['Motoren kører. Vi er klar, når du er.', 'Hold dig i skyggen mellem containerne.'],
      },
      done: [
        ['janni', 'Sagen er lukket. Filen er i sikkerhed, og kureren er afleveret til politiet.'],
        ['soeren', (name) => `Vi kører hjem. Der er kakao til alle. Dobbelt portion til agent ${name}.`],
        ['frej', 'Okay, okay. Du var … ret fantastisk. Sig det ikke til nogen.'],
      ],
    },
    mole: {
      tips: [
        'Her er mørkt. Beviserne glimter, når din lygte rammer dem.',
        'Du skal finde tre beviser: et foto, et skoaftryk og en telefon.',
        'Ingen stopur. Tag den med ro.',
      ],
      goals: {
        search: (n) => `Find beviserne i mørket (${n}/3)`,
        board: 'Gå til deduktionstavlen',
      },
      start: 'Tænd lygten, og led efter glimt i mørket. Tre beviser gemmer sig herinde.',
      found: [
        'Første bevis sikret! To tilbage.',
        'Andet bevis! Kun ét tilbage nu.',
        'Alle tre beviser er fundet. Nu skal vi bare lægge to og to sammen.',
      ],
      toBoard: 'Kom hen til tavlen. Hvem passer med alle tre beviser?',
      robotCaught: 'BIIIP! Robotstøvsugeren kørte ind i dig og hylede. Vi starter forfra ved døren.',
      phoneHint: 'Telefonen husker de sidste toner. Lyt – og tast dem igen.',
    },
  },

  // Kid-level riddles. Each has one right answer and three wrong ones.
  riddles: [
    { id: 'klaver', q: 'Hvad har tangenter, men kan ikke låse en eneste dør op?', a: 'Et klaver', wrong: ['En nøglering', 'En skuffe', 'Et pengeskab'] },
    { id: 'haandklaede', q: 'Hvad bliver vådere, jo mere det tørrer?', a: 'Et håndklæde', wrong: ['En svamp', 'En paraply', 'En regnjakke'] },
    { id: 'naal', q: 'Hvad har et øje, men kan ikke se?', a: 'En nål', wrong: ['En sko', 'En knap', 'Et vindue'] },
    { id: 'fodspor', q: 'Jo flere du tager, jo flere efterlader du. Hvad er det?', a: 'Fodspor', wrong: ['Billeder', 'Kager', 'Noter'] },
    { id: 'alder', q: 'Hvad går op, men kommer aldrig ned igen?', a: 'Din alder', wrong: ['En ballon', 'En elevator', 'En raket'] },
    { id: 'ur', q: 'Hvad har hænder, men kan ikke klappe?', a: 'Et ur', wrong: ['En handske', 'En robot', 'En dukke'] },
    { id: 'flaske', q: 'Hvad har en hals, men intet hoved?', a: 'En flaske', wrong: ['En giraf', 'En trøje', 'En guitar'] },
    { id: 'bord', q: 'Hvad har fire ben, men kan ikke gå et eneste skridt?', a: 'Et bord', wrong: ['En hund', 'En stol med hjul', 'En edderkop'] },
    { id: 'navn', q: 'Hvad er dit, men bliver brugt mest af alle andre?', a: 'Dit navn', wrong: ['Din cykel', 'Din telefon', 'Din madpakke'] },
    { id: 'stilhed', q: 'Hvad går i stykker, så snart man siger dets navn?', a: 'Stilhed', wrong: ['Et æg', 'Et glas', 'En hemmelighed'] },
    { id: 'kam', q: 'Hvad har mange tænder, men bider aldrig?', a: 'En kam', wrong: ['En haj', 'En lynlås', 'En krokodille'] },
    { id: 'skygge', q: 'Den følger dig hele dagen, men forsvinder i mørke. Hvad er det?', a: 'Din skygge', wrong: ['Din lillebror', 'En spion', 'En kat'] },
  ],

  shortcut: (a, b) => `Agent-genvej: ved du ${a} × ${b}, ved du også ${b} × ${a}.`,

  speakers: {
    vilde: 'Vilde',
    janni: 'Janni',
    soeren: 'Søren',
    frej: 'Frej',
    mynthe: 'Mynthe',
    kureren: 'Kureren',
    holm: 'Holm',
    kasper: 'Kasper',
    nora: 'Nora',
    ib: 'Ib',
  },

  roles: {
    janni: 'Bureauchef',
    soeren: 'Logistik',
    frej: 'Backup i vognen',
    mynthe: 'Teknik og gadgets',
    vilde: 'Agent',
    kureren: 'Mistænkt',
    holm: 'Arkivar',
    kasper: 'Pedel',
    nora: 'Praktikant',
    ib: 'Postbud',
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
