
import { Profile } from '../../../../types';
import { notablePeople } from './notable-people';
import { currentLeaders } from './current-leaders';

export const deltaPeople: Profile[] = [
    ...notablePeople,
    ...currentLeaders,
];
