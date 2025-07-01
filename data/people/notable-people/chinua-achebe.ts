import { Profile, PersonaType, PersonSubtype } from '../../../types';

export const chinuaAchebeProfile: Profile = { 
    id: 'chinua-achebe', 
    name: 'Chinua Achebe', 
    personaType: PersonaType.PERSON, 
    personSubtype: PersonSubtype.NOTABLE_PERSON, 
    avatar: 'https://picsum.photos/seed/achebe/96/96', 
    title: 'Author & Critic', 
    description: 'A towering figure of modern African literature.', 
    sections: [{ title: 'Magnum Opus', content: 'His novel "Things Fall Apart" is a seminal work of African literature, translated into over 50 languages and read and studied worldwide.' }],
    dateOfBirth: '1930-11-16', 
    profession: 'Novelist, Poet, & Critic', 
    city: 'Ogidi', 
    stateOfOrigin: 'Anambra State'
};
