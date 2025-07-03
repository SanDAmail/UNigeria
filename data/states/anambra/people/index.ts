
import { Profile } from '../../../../types';
import { notablePeople } from './notable-people';
import { currentLeaders } from './current-leaders';
import { formerLeaders } from './former-leaders';

export const anambraPeople: Profile[] = [
    ...notablePeople,
    ...currentLeaders,
    ...formerLeaders,
];