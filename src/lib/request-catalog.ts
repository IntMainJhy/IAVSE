import {cache} from 'react';
import {readPublicSkills} from './catalog-public-skills.mjs';

// React cache lasts only for this server render, including metadata. The next
// request re-reads publication state, so withdrawals and moderation stay live.
export const readRequestSkills=cache(readPublicSkills);
