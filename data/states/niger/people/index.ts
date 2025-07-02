
import { Profile } from '../../../../types';
import { currentLeaders } from './current-leaders';
import { formerLeaders } from './former-leaders';
import { notablePeople } from './notable-people';

export const nigerPeople: Profile[] = [
    ...currentLeaders,
    ...formerLeaders,
    ...notablePeople,
];