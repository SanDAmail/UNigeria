import { Profile } from '../types';
import { nigeriaProfile } from './nigeria-profile';
import { stateProfiles } from './states';
import { peopleProfiles } from './people';
import { unigerianProfiles } from './unigerians';
import { forumProfiles } from './forums';

export const ALL_PROFILES: Profile[] = [
    nigeriaProfile,
    ...stateProfiles,
    ...peopleProfiles,
    ...unigerianProfiles,
    ...forumProfiles,
];