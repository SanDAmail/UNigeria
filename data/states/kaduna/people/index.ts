
import { Profile } from '../../../../types';
import { currentLeaders } from './current-leaders';
import { notablePeople } from './notable-people';

export const kadunaPeople: Profile[] = [
    ...currentLeaders,
    ...notablePeople,
];