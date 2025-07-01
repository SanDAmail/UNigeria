import { Profile, PersonaType } from '../../types';

export const communityProjectsProfile: Profile = { 
    id: 'community-projects', 
    name: 'Community Projects', 
    personaType: PersonaType.FORUM, 
    avatar: 'https://picsum.photos/seed/community/96/96', 
    title: 'Local & Grassroots Initiatives',
    description: 'A space for citizens to propose, organize, and discuss local initiatives and community development projects.', 
    sections: [],
    keyTopics: ['Local Sanitation Drives', 'Community Policing and Security Watch', 'Fundraising for local schools/clinics', 'Improving local market conditions'],
    forumRules: ['Focus on actionable ideas and solutions.', 'Collaborate and build on others\' suggestions.', 'Keep discussions relevant to community improvement.', 'Be supportive of fellow community members.']
};
