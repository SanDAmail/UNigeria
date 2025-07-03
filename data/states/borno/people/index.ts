
import { Profile } from '../../../../types';
import { currentLeaders } from './current-leaders';
import { notablePeople } from './notable-people';

export const bornoPeople: Profile[] = [
    ...currentLeaders,
    ...notablePeople,
];