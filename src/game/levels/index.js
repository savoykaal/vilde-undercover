// Every playable level, by id.

import c1 from './c1.js';
import c2 from './c2.js';
import c3 from './c3.js';
import c4 from './c4.js';
import c5 from './c5.js';
import { m1, m2, m3, m4 } from './mole.js';

export const LEVELS = { c1, c2, c3, c4, c5, m1, m2, m3, m4 };

export const levelById = (id) => LEVELS[id] ?? null;
