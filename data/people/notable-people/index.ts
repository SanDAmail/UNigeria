import { Profile } from '../../../types';
import { adaezeArtistProfile } from './adaeze-artist';

// This file now only exports profiles that do NOT have a state of origin.
// State-based profiles are aggregated in data/people/index.ts
export const notablePeopleProfiles: Profile[] = [
    adaezeArtistProfile,
];
