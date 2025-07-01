import { Profile, PersonaType, PersonSubtype } from '../../../types';

export const muhammaduBuhariProfile: Profile = { 
    id: 'muhammadu-buhari', 
    name: 'Muhammadu Buhari', 
    personaType: PersonaType.PERSON, 
    personSubtype: PersonSubtype.FORMER_LEADER, 
    avatar: 'https://picsum.photos/seed/buhari/96/96', 
    description: 'Former President of Nigeria (2015-2023).',
    sections: [{ title: 'Administration', content: 'His presidency focused on a three-pronged agenda: anti-corruption, security, and economic development. He previously served as military head of state from 1983 to 1985.' }],
    dateOfBirth: '1942-12-17', 
    profession: 'Retired Military General & Politician', 
    stateOfOrigin: 'Katsina State',
    title: 'Former President of Nigeria'
};
