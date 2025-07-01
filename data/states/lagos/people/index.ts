import { Profile } from '../../../../types';
import { currentLeaders } from './current-leaders';

// In the future, former leaders and notable people from Lagos would be imported here too.
// import { formerLeaders } from './former-leaders';
// import { notablePeople } from './notable-people';

export const lagosPeople: Profile[] = [
    ...currentLeaders,
    // ...formerLeaders,
    // ...notablePeople,
];
