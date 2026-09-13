// All player-facing text. Swap this object to change language.

export const strings = {
  appName: 'Agent Vilde',
  appTagline: 'Familiebureauet',

  placeholder: {
    heading: 'Bureauet bliver sat op',
    body: 'Mynthe tester stadig udstyret i kælderen. Kom tilbage om lidt.',
  },

  difficulty: {
    let: 'Let',
    mellem: 'Mellem',
    svaer: 'Svær',
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
