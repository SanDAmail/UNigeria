import { Profile, PersonaType, PersonSubtype } from '../../../../../types';

export const mikeAdenugaProfile: Profile = {
    id: 'mike-adenuga',
    name: 'Mike Adenuga',
    personaType: PersonaType.PERSON,
    personSubtype: PersonSubtype.NOTABLE_PERSON,
    avatar: 'https://picsum.photos/seed/adenuga/96/96',
    title: 'Business Magnate',
    description: 'A reclusive Nigerian billionaire businessman, and founder of Globacom and Conoil.',
    dateOfBirth: '1953-04-29',
    profession: 'Businessman',
    stateOfOrigin: 'Ogun State',
    careerHighlights: [
        'Made his first fortune in the 1970s trading lace and distributing soft drinks.',
        'His company, Consolidated Oil (Conoil), was the first indigenous Nigerian company to strike oil in commercial quantities in the 1990s.',
        'Launched Globacom in 2003, which grew to become Nigeria\'s second-largest telecom operator.',
        'Globacom was the first company to build an $800 million high-capacity fibre-optic cable, GLO-1, from the UK to Nigeria.',
    ],
    projects: [
        'Oil & Gas: Founding of Conoil Producing, the first indigenous company to strike oil in commercial quantities.',
        'Telecommunications: Launch of Globacom, a major pan-African telecommunications company.',
        'Infrastructure: The GLO-1 submarine communications cable, a high-capacity fiber-optic cable linking West Africa to the rest of the world.',
        'Sports Philanthropy: Major sponsorship of Nigerian and Ghanaian national football teams and leagues for many years.'
    ],
    legacyAndImpact: 'Mike Adenuga is a pivotal figure in the Nigerian oil and telecommunications sectors. His success with Conoil demonstrated the capability of indigenous firms in the capital-intensive oil industry. With Globacom, he introduced per-second billing and crashed the cost of SIM cards, democratizing access to mobile telephony for millions of Nigerians. He is known for his private nature and immense business acumen.',
    awardsAndHonours: [
        'Grand Commander of the Order of the Niger (GCON).',
        'Companion of the Star of Ghana (CSG).',
    ]
};