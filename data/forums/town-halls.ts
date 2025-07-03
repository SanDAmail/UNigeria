import { Profile, PersonaType } from '../../types';

export const townHallsProfile: Profile = { 
    id: 'town-halls', 
    name: 'Town Halls', 
    personaType: PersonaType.FORUM, 
    avatar: 'https://picsum.photos/seed/townhall/96/96', 
    title: 'National Policy Discussions',
    description: 'This forum is for discussing national policies, proposed bills, and current events with input from various simulated viewpoints.', 
    sections: [],
    keyTopics: ['Economic Policies (e.g., subsidy, taxation)', 'Security Strategies', 'Infrastructural Development', 'Electoral and Constitutional Reforms'],
    forumRules: ['Maintain a respectful and constructive tone.', 'Base arguments on facts and logic.', 'No personal attacks or hate speech.', 'Stay on topic within the discussion thread.']
};
