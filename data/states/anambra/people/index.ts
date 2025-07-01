
import { Profile } from '../../../../types';
import { notablePeople } from './notable-people';
import { currentLeaders } from './current-leaders';

export const anambraPeople: Profile[] = [
    ...notablePeople,
    ...currentLeaders,
];
