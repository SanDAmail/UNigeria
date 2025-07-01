
import { Profile } from '../../../../types';
import { currentLeaders, formerLeaders } from './current-leaders';

export const katsinaPeople: Profile[] = [
    ...currentLeaders,
    ...formerLeaders,
];
