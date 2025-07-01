
import { Profile } from '../../../../../types';
import { muhammaduBuhariProfile } from '../former-leaders/muhammadu-buhari'; // Note: This is a former leader, but the file is here
import { dikkoRaddaProfile } from './dikko-radda';

// The current structure places former leaders in a separate folder, so this file should ideally only have current leaders.
// Keeping Buhari here reflects the user's file structure but is noted for potential refactoring.
export const currentLeaders: Profile[] = [
    dikkoRaddaProfile,
];

export const formerLeaders = [
    muhammaduBuhariProfile,
]
