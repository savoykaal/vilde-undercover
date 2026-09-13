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

  hq: {
    hubSpeaker: 'Janni · bureauchef',
    hubLines: [
      'Nordlys-filen er forsvundet fra arkivet, og vi har opsnappet en kodet besked. Start med kapitel 1.',
      'Vi kender tid og sted. Nu skal manden med den grå hat skygges.',
      'Kontorhuset har en lukket syvende sal. Den skal vi ind på.',
      'Vi er inde i arkivet. Find filen, før nogen opdager os.',
      'Sidste kapitel. Kureren kommer til havnen i aften.',
    ],
    hubDone: (name) => `Hele sagen er løst. Arkivet har fået en ny mappe: "Agent ${name} – tophemmelig".`,
    listTitle: 'Sagsmapper',
    solvedCount: (n) => `${n} af 5 løst`,
    chapterLabel: (n) => `Kapitel ${n}`,
    chapterOf: (n) => `Kapitel ${n} af 5`,
    open: 'Klar · tryk for at åbne',
    replay: 'Løst · tryk for at spille igen',
    locked: (n) => `Forseglet · løs kapitel ${n} først`,
    inProgress: (clues, total) => `Fortsæt · ${clues} af ${total} spor`,
    stamp: 'Løst',
    segmentLabel: {
      brief: 'Briefing',
      partA: 'Spor',
      twist: 'Twist',
      partB: 'Spor',
      resolution: 'Afslutning',
    },
    pause: 'Pause',
    clues: 'Spor',
    narrator: 'Sagen',
    partStartA: 'Hvert rigtigt svar giver et nyt spor. Kom så, agent.',
    partStartB: 'Anden halvdel af sagen. Vi er tæt på nu.',
    solvedTitle: 'Kapitlet er stemplet',
    solvedLine: 'Endnu en sagsmappe med LØST på forsiden. Godt arbejde, agent.',
    finaleTitle: 'Hele sagen er løst!',
    finaleLine: (name) => `Nordlys-filen er sikret, kureren er fanget, og bureauet har fået en ny stjerne. Tak, agent ${name}.`,
    nextChapter: (n) => `Start kapitel ${n}`,
    backToHq: 'Tilbage til HQ',

    // Beats are [speaker, text]. Text can be a function of the agent's name.
    chapters: [
      {
        title: 'Den kodede besked',
        teaser: 'Opsnap og knæk en hemmelig besked.',
        brief: [
          ['janni', 'Godmorgen, agent. I nat forsvandt Nordlys-filen fra bureauets arkiv.'],
          ['janni', 'Tyven sender beskeder i kode. Og vi har lige opsnappet én.'],
          ['mynthe', 'Beskeden er fuld af regnestykker. Hvert svar er et bogstav. Det er så nørdet. Jeg ELSKER det.'],
          ['frej', 'Jeg sidder klar i vognen med snacks. Sig til, hvis I får brug for muskler. Eller chips.'],
        ],
        stepsA: [
          'Første bogstav: K.',
          'Andet bogstav: U. Det begynder at ligne noget.',
          'R … Mynthe skriver hurtigere og hurtigere.',
          'E. Frej holder op med at spise. Det er alvor.',
          'Og et R. KURER. Beskeden handler om en kurer!',
        ],
        twist: [
          ['mynthe', 'Vent. Beskeden fortsætter – og nu er den skrevet i en helt ny kode!'],
          ['soeren', 'Nogen ved, at vi lytter med. Rolig nu. Én ting ad gangen.'],
        ],
        stepsB: [
          'Første tal i den nye kode: 1.',
          'Så et 5. Er det et klokkeslæt?',
          'Et 3 og et 0. Klokken halv fire!',
          'Et gadenavn dukker op: Torvegade.',
          'Sidste ord: "grå hat". Kureren går med grå hat!',
        ],
        resolution: [
          ['janni', 'Torvegade, klokken 15.30, en kurer med grå hat. Flot arbejde, agent.'],
          ['frej', 'En grå hat? Hvem går med grå hat i dag? Det bliver let.'],
          ['soeren', 'Det siger du hver gang. Pak madpakken, vi skal ud.'],
        ],
        setbacks: [
          'Mynthe kradser sig i håret. Det bogstav var svært at læse.',
          'Signalet skratter lidt. Vi prøver igen.',
          'Kodebogen blafrer i vinden fra ventilatoren. Én gang til.',
        ],
      },
      {
        title: 'Skygge i byen',
        teaser: 'Følg manden med den grå hat gennem byen.',
        brief: [
          ['janni', 'Klokken er 15.29. Du står på Torvegade med en is som forklædning.'],
          ['soeren', 'Hold afstand. Tre meter bag ham. Aldrig to.'],
          ['frej', 'Og spis ikke isen for hurtigt. Jeg fik hjernefrysning midt i en skygning engang.'],
          ['mynthe', 'Jeg følger dig på GPS. Hvert kryds har en kode – så ved jeg, at du er okay.'],
        ],
        stepsA: [
          'Der! Grå hat, sort taske. Han går mod havnen.',
          'Han stopper ved et vindue. Du kigger på skoene i butikken ved siden af.',
          'Han drejer til venstre ved bageriet. Du følger efter.',
          'Han kigger sig over skulderen. Du slikker roligt på din is.',
          'Han krydser broen. Du holder tre meters afstand. Præcis.',
        ],
        twist: [
          ['frej', 'Øh … der er TO grå hatte nu. Han har mødt en anden fyr med grå hat!'],
          ['mynthe', 'De bytter tasker! Den ene går mod stationen, den anden mod parken.'],
          ['janni', 'Følg tasken, agent. Ikke hatten.'],
        ],
        stepsB: [
          'Du følger den sorte taske mod parken.',
          'Manden sætter farten op. Du går hurtigt, men roligt.',
          'Han går ind ad en låge ved et højt, gråt kontorhus.',
          'Du ser et skilt: "Vestergaard Arkiver – kun adgang med kort".',
          'Han forsvinder ind ad døren. Men nu ved du, hvor han er.',
        ],
        resolution: [
          ['mynthe', 'Vestergaard Arkiver. Syvende sal er lukket for alle – selv for rengøringen.'],
          ['soeren', (name) => `Så er det dér, filen er. Godt skygget, ${name}.`],
          ['frej', 'Hvad skete der med isen? Gav du den til en due? Legendarisk.'],
        ],
        setbacks: [
          'Han stopper op. Du kigger meget interesseret på en lygtepæl.',
          'En cykel suser forbi og spærrer udsynet et øjeblik.',
          'Du mister ham et sekund i mængden – der er han igen.',
        ],
      },
      {
        title: 'Syvende sal',
        teaser: 'Kom forbi kort, fingeraftryk og en vagt med kaffe.',
        brief: [
          ['janni', 'Syvende sal kræver adgangskort, fingeraftryk og en kode.'],
          ['mynthe', 'Kortet har jeg kopieret. Fingeraftrykket snyder vi med gelé. Koden … den er din.'],
          ['soeren', 'Jeg har lånt en rengøringsvogn. Du er nu praktikant. Smil.'],
        ],
        stepsA: [
          'Kortlæseren blinker grønt. Første dør er åben.',
          'Elevatoren kører. 3., 4., 5. sal …',
          'Mynthe hacker kameraet. Det viser nu en video af en kat.',
          'Geléfingeren virker! Scanneren bipper glad.',
          'Syvende sal. Gangen er lang og helt stille.',
        ],
        twist: [
          ['frej', 'Stop! En vagt er på vej op ad trappen. Han har en KAFFEKOP.'],
          ['soeren', 'Ind i kopirummet. Nu.'],
          ['mynthe', 'Han går først, når kaffen er drukket. Knæk koden til bagdøren imens!'],
        ],
        stepsB: [
          'Du sniger dig hen til bagdøren i kopirummet.',
          'Kodelåsen har fem cifre. Det første sidder!',
          'Vagten puster på sin kaffe. Andet og tredje ciffer sidder.',
          'Vagten tager en slurk. Fjerde ciffer!',
          'Femte ciffer. Klik! Bagdøren glider op.',
        ],
        resolution: [
          ['mynthe', 'Du er inde! Arkivet har tusind skuffer. Én af dem gemmer filen.'],
          ['frej', 'Kaffevagten opdagede ingenting. Han så bare katten.'],
          ['janni', 'Kapitlet er løst. Hvil dig lidt – og så finder vi filen.'],
        ],
        setbacks: [
          'Scanneren tænker lidt. Prøv igen.',
          'Elevatoren hopper et øjeblik. Alt er okay.',
          'Vagten nyser nedenunder. Hold roen.',
        ],
      },
      {
        title: 'Den stjålne fil',
        teaser: 'Tusind skuffer. Én fil. Et signal, der bipper.',
        brief: [
          ['janni', 'Tusind skuffer, én fil. Hver skuffe har et nummer, og nummeret er et regnestykke.'],
          ['mynthe', 'Filen sender et svagt signal. Jo tættere du kommer, jo mere bipper min scanner.'],
          ['frej', 'Og du må ikke tage noget andet med. Heller ikke den flotte kuglepen. Jeg kan se dig.'],
        ],
        stepsA: [
          'Bip … bip. Signalet er svagt. Række A.',
          'Bip, bip. Række D. Varmere.',
          'Bipbipbip. Række G. Meget varmere!',
          'Skuffe G-42. Du åbner den forsigtigt.',
          'En blå mappe: NORDLYS. Du har den!',
        ],
        twist: [
          ['mynthe', 'Vent … scanneren bipper stadig. Mappen er TOM. Den er en attrap!'],
          ['soeren', 'Så har de flyttet den ægte fil. Men attrappen efterlader et spor.'],
          ['mynthe', 'Der sidder en chip i ryggen. Den peger på pengeskabet i direktørens kontor.'],
        ],
        stepsB: [
          'Du lister hen mod direktørens kontor.',
          'Pengeskabet har et gammelt drejehjul. Første tal sidder.',
          'Andet tal. Der lyder et lille klik.',
          'Tredje tal. Håndtaget kan drejes.',
          'Døren glider op. Den ægte Nordlys-fil ligger indenfor!',
        ],
        resolution: [
          ['janni', 'Nordlys-filen er tilbage i vores hænder. Jeg er virkelig stolt af dig.'],
          ['frej', 'Det var dig, der gjorde det. Men jeg passede vognen. Meget vigtigt job.'],
          ['mynthe', 'Chippen afslører én ting mere: Kureren skal hente filen i aften. På havnen.'],
        ],
        setbacks: [
          'Scanneren mister signalet et øjeblik. Det kommer igen.',
          'En skuffe knirker. Ingen hørte det.',
          'Drejehjulet glider forbi tallet. Drej igen.',
        ],
      },
      {
        title: 'Kureren',
        teaser: 'Mød kureren på havnen i tågen.',
        brief: [
          ['janni', 'I aften kommer kureren til havnen for at hente filen. Men filen er hos os.'],
          ['soeren', 'Så vi stiller en kuffert med noget helt andet i. Og så venter vi.'],
          ['mynthe', 'Kufferten har en sporingschip, en alarm og … konfetti. Det var Frejs idé.'],
          ['frej', 'Man skal have lidt stil.'],
        ],
        stepsA: [
          'Havnen, lagerhal 7. Tåge over vandet.',
          'Du gemmer dig bag nogle containere.',
          'En båd lægger til. Grå hat. Det er kureren.',
          'Han går hen mod kufferten på bænken.',
          'Han rækker ud efter låsene …',
        ],
        twist: [
          ['frej', 'Øh. Han tager ikke kufferten. Han kigger direkte på DIG.'],
          ['kureren', 'Jeg vidste, at bureauet ville sende nogen. Men så ung en agent? Seriøst?'],
          ['janni', 'Hun er vores bedste agent. Hold ham snakkende, så kommer vi.'],
        ],
        stepsB: [
          'Du træder frem. "Nordlys-filen er i sikkerhed," siger du roligt.',
          'Kureren tager et skridt tilbage. Det havde han ikke regnet med.',
          'Mynthe slukker lyset på havnen. Mørke!',
          'Søren tænder billygterne. Kureren står fanget i lyset.',
          'Han prøver at løbe – lige ind i Frej. Og en eksplosion af konfetti.',
        ],
        resolution: [
          ['kureren', 'Konfetti? KONFETTI? Det her er det mest pinlige øjeblik i hele min karriere.'],
          ['janni', 'Sagen er lukket. Filen er i sikkerhed, og kureren er afleveret til politiet.'],
          ['soeren', (name) => `Vi kører hjem. Der er kakao til alle. Dobbelt portion til agent ${name}.`],
          ['frej', 'Okay, okay. Du var … ret fantastisk. Sig det ikke til nogen.'],
        ],
        setbacks: [
          'Tågen bliver tættere et øjeblik. Vent lidt.',
          'En måge skriger. Kureren kigger den anden vej.',
          'Containeren knirker. Bliv i skyggen.',
        ],
      },
    ],
  },

  mole: {
    hubSpeaker: 'Janni · bureauchef',
    hubLines: [
      'Nogen bytter vores ægte mapper ud med falske. Find ud af hvem.',
      'Kasper fik en seddel fra "M". Muldvarpen har flere hjælpere.',
      'Muldvarpen lader andre gøre det beskidte arbejde. Vi må tættere på.',
      'Arkivets printer. Kun én person har koden. Nu skal Muldvarpen afsløres.',
    ],
    hubDone: 'Muldvarpen er fanget, og alle de ægte mapper er tilbage i arkivet. Fantastisk opklaret.',
    noTimer: 'Ingen stopur her. Ingen travlhed. Kun spor.',
    chapterList: 'Kapitler',
    solvedCount: (n) => `${n} af 4 opklaret`,
    suspectsTitle: 'De mistænkte',
    chapterLabel: (n) => `Kapitel ${n}`,
    chapterOf: (n) => `Kapitel ${n} af 4`,
    status: {
      open: 'Klar · tryk for at åbne',
      replay: 'Opklaret · tryk for at spille igen',
      locked: (n) => `Forseglet · opklar kapitel ${n} først`,
      clues: (n, total) => `Fortsæt · ${n} af ${total} beviser`,
      intro: 'Fortsæt briefingen',
      deduce: 'Klar til deduktionstavlen',
      resolution: 'Fortsæt afsløringen',
    },
    phaseLabel: {
      intro: 'Briefing',
      resolution: 'Afsløring',
    },
    stamp: 'Afsløret',
    pause: 'Pause',
    evidence: 'Beviser',
    clues: {
      photo: { name: 'Overvågningsfoto', clear: (v) => `Trøjen er ${v}` },
      shoe: { name: 'Skoaftryk', clear: (v) => `Skostørrelse ${v}` },
      phone: { name: 'Telefonstump', clear: (v) => `Nummeret slutter på ${v}` },
    },
    developing: (level, total) => `Fremkalder … ${level}/${total}`,
    colors: { roed: 'rød', blaa: 'blå' },
    attributes: { photo: 'Trøje', shoe: 'Sko', phone: 'Telefon' },
    attrValue: {
      photo: (v) => ({ roed: 'Rød', blaa: 'Blå' })[v],
      shoe: (v) => `Str. ${v}`,
      phone: (v) => `…${v}`,
    },
    deduceEyebrow: (n) => `Kapitel ${n} · deduktionstavle`,
    deduceTitle: 'Hvem byttede mapperne?',
    deduceTitleFinal: 'Hvem er Muldvarpen?',
    deduceSub: 'Sammenlign beviserne med de mistænkte. Tryk på den, du tror, det er.',
    suspectsHeading: 'Mistænkte',
    ruledOut: 'Udelukket',
    accuseQuestion: (name) => `Anklag ${name}?`,
    accuseSub: 'Passer alle tre beviser?',
    accuse: 'Anklag',
    digEyebrow: 'Ikke helt',
    digDeeper: 'Grav videre',
    backToBoard: 'Tilbage til tavlen',
    mismatch: {
      photo: (name, evidence, own) => `Personen på fotoet har ${evidence} trøje, men ${name} har ${own}.`,
      shoe: (name, evidence, own) => `Skoaftrykket er str. ${evidence}, men ${name} bruger str. ${own}.`,
      phone: (name, evidence, own) => `Nummeret slutter på ${evidence}, men ${name}s telefon slutter på ${own}.`,
    },
    revealEyebrow: 'Afsløret',
    revealTitle: (name) => `Det var ${name}!`,
    hearStory: 'Hør forklaringen',
    solvedTitle: 'Kapitlet er opklaret',
    solvedLine: 'Hjælperen er fundet. Men Muldvarpen gemmer sig stadig. Godt gravet, agent.',
    finaleTitle: 'Muldvarpen er afsløret!',
    finaleLine: (name) => `Alle fire kapitler er opklaret. Du fandt Muldvarpen, agent ${name} – helt uden stopur.`,
    nextChapter: (n) => `Start kapitel ${n}`,
    backToCase: 'Tilbage til sagen',

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

  story: {
    pause: 'Pause',
    next: 'Videre',
    tapHint: 'Tryk hvor som helst for at fortsætte',
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
