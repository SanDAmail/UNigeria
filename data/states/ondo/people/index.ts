
import { Profile } from '../../../../types';
import { currentLeaders } from './current-leaders';

export const ondoPeople: Profile[] = [
    ...currentLeaders,
];
