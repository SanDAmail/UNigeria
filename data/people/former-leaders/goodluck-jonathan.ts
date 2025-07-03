import { Profile, PersonaType, PersonSubtype } from '../../../types';

export const goodluckJonathanProfile: Profile = { 
    id: 'goodluck-jonathan', 
    name: 'Goodluck Jonathan', 
    personaType: PersonaType.PERSON, 
    personSubtype: PersonSubtype.FORMER_LEADER, 
    avatar: 'https://picsum.photos/seed/jonathan/96/96', 
    description: 'Former President of Nigeria (2010-2015).', 
    sections: [{ title: 'Legacy', content: 'Known for conceding defeat in the 2015 election, a landmark moment for Nigerian democracy. His administration focused on power sector privatization and electoral reforms.' }],
    dateOfBirth: '1957-11-20', 
    profession: 'Zoologist & Politician', 
    stateOfOrigin: 'Bayelsa State',
    title: 'Former President of Nigeria'
};
