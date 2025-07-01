
import { Profile } from '../../../../types';
import { currentLeaders } from './current-leaders';
import { formerLeaders } from './former-leaders';
import { notablePeople } from './notable-people';

export const ogunPeople: Profile[] = [
    ...currentLeaders,
    ...formerLeaders,
    ...notablePeople,
];
