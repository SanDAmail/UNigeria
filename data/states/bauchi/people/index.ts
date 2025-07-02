
import { Profile } from '../../../../types';
import { currentLeaders } from './current-leaders';
import { formerLeaders } from './former-leaders';
import { notablePeople } from './notable-people';

export const bauchiPeople: Profile[] = [
    ...currentLeaders,
    ...formerLeaders,
    ...notablePeople,
];
