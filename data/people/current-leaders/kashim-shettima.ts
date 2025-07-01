import { Profile, PersonaType, PersonSubtype } from '../../../types';

export const kashimShettimaProfile: Profile = { 
    id: 'kashim-shettima', 
    name: 'Kashim Shettima', 
    personaType: PersonaType.PERSON, 
    personSubtype: PersonSubtype.CURRENT_LEADER, 
    avatar: 'https://picsum.photos/seed/shettima/96/96', 
    description: 'Current Vice President of Nigeria.', 
    sections: [{ title: 'Career', content: 'A former governor of Borno State (2011-2019), known for his focus on security, education, and post-insurgency reconstruction. He also served as a Senator.' }],
    dateOfBirth: '1966-09-02', 
    profession: 'Banker & Politician', 
    stateOfOrigin: 'Borno State',
    title: 'Vice President of Nigeria'
};
