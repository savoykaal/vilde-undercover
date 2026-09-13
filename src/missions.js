// The four case files on the home board, with how each reports its progress.
// Progress only ever counts up (best floor, chapters solved, gadgets built).

import { strings } from './i18n.js';

export const MISSIONS = [
  {
    id: 'hq',
    code: '01',
    progress(profile) {
      const n = profile.missions.hq?.solved?.length ?? 0;
      return { ratio: n / 5, label: strings.missions.hq.progress(n) };
    },
  },
  {
    id: 'vault',
    code: '02',
    progress(profile) {
      const floor = profile.missions.vault?.bestFloor ?? 0;
      return { ratio: floor / 10, label: strings.missions.vault.progress(floor) };
    },
  },
  {
    id: 'mole',
    code: '03',
    progress(profile) {
      const n = profile.missions.mole?.solved?.length ?? 0;
      return { ratio: n / 4, label: strings.missions.mole.progress(n) };
    },
  },
  {
    id: 'lab',
    code: '04',
    progress(profile) {
      const n = profile.missions.lab?.built?.length ?? 0;
      return { ratio: n / 6, label: strings.missions.lab.progress(n) };
    },
  },
];

export const missionById = (id) => MISSIONS.find((m) => m.id === id);
