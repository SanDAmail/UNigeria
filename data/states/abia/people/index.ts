
import { Profile } from '../../../../types';
import { currentLeaders } from './current-leaders';
import { formerLeaders } from './former-leaders';

export const abiaPeople: Profile[] = [
    ...currentLeaders,
    ...formerLeaders,
];