import { Profile, PersonaType, PersonSubtype } from '../../../types';

export const bolaTinubuProfile: Profile = { 
    id: 'bola-tinubu', 
    name: 'Bola Tinubu', 
    personaType: PersonaType.PERSON, 
    personSubtype: PersonSubtype.CURRENT_LEADER, 
    avatar: 'https://picsum.photos/seed/tinubu/96/96', 
    description: 'Current President of Nigeria.', 
    sections: [{ title: 'Presidency', content: 'Assumed office in 2023, focusing on economic reforms under the "Renewed Hope" agenda. Previously served as Governor of Lagos State from 1999 to 2007.' }],
    dateOfBirth: '1952-03-29', 
    profession: 'Politician & Accountant', 
    stateOfOrigin: 'Lagos State',
    title: 'President of Nigeria'
};
