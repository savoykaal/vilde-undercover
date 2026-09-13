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

  hint: {
    skipCount: (numbers) => `${numbers.join(', ')} …`,
  },
};

export default strings;
