
import { Profile } from '../../../../types';
import { currentLeaders } from './current-leaders';
import { formerLeaders } from './former-leaders';
import { notablePeople } from './notable-people';

export const sokotoPeople: Profile[] = [
    ...currentLeaders,
    ...formerLeaders,
    ...notablePeople,
];