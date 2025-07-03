import { Profile, PersonaType, PersonSubtype } from '../../../types';

export const ngoziOkonjoIwealaProfile: Profile = { 
    id: 'ngozi-okonjo-iweala', 
    name: 'Ngozi Okonjo-Iweala', 
    personaType: PersonaType.PERSON, 
    personSubtype: PersonSubtype.NOTABLE_PERSON, 
    avatar: 'https://picsum.photos/seed/ngozi/96/96', 
    title: 'Director-General of the WTO', 
    description: 'An influential economist and international development expert.', 
    sections: [{ title: 'Global Impact', content: 'The first woman and first African to lead the World Trade Organization. She previously served two terms as Finance Minister of Nigeria.' }],
    dateOfBirth: '1954-06-13', 
    profession: 'Economist', 
    city: 'Ogwashi-Uku', 
    stateOfOrigin: 'Delta State'
};
