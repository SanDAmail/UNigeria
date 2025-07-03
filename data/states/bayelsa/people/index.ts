
import { Profile } from '../../../../types';
import { formerLeaders } from './former-leaders';
import { currentLeaders } from './current-leaders';

export const bayelsaPeople: Profile[] = [
    ...formerLeaders,
    ...currentLeaders,
];
