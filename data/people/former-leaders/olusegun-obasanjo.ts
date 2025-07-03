import { Profile, PersonaType, PersonSubtype } from '../../../types';

export const olusegunObasanjoProfile: Profile = { 
    id: 'olusegun-obasanjo', 
    name: 'Olusegun Obasanjo', 
    personaType: PersonaType.PERSON, 
    personSubtype: PersonSubtype.FORMER_LEADER, 
    avatar: 'https://picsum.photos/seed/obasanjo/96/96', 
    description: 'Former President of Nigeria (1999-2007).', 
    sections: [{ title: 'Post-Presidency', content: 'Remains an influential elder statesman in Nigerian and African politics. He also served as military head of state from 1976 to 1979, overseeing the transition to democracy.' }],
    dateOfBirth: '1937-03-05', 
    profession: 'Retired Military General & Politician', 
    stateOfOrigin: 'Ogun State',
    title: 'Former President of Nigeria'
};
