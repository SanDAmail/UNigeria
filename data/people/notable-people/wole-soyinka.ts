import { Profile, PersonaType, PersonSubtype } from '../../../types';

export const woleSoyinkaProfile: Profile = { 
    id: 'wole-soyinka', 
    name: 'Wole Soyinka', 
    personaType: PersonaType.PERSON, 
    personSubtype: PersonSubtype.NOTABLE_PERSON, 
    avatar: 'https://picsum.photos/seed/soyinka/96/96', 
    title: 'Nobel Laureate', 
    description: 'A Nigerian playwright, novelist, poet, and essayist.',
    sections: [{ title: 'Achievements', content: 'Awarded the 1986 Nobel Prize in Literature, the first sub-Saharan African to be honored in that category. A prominent political activist and critic.' }],
    dateOfBirth: '1934-07-13', 
    profession: 'Writer & Professor', 
    city: 'Abeokuta', 
    stateOfOrigin: 'Ogun State'
};
