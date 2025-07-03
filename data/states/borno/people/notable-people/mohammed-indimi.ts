import { Profile, PersonaType, PersonSubtype } from '../../../../../types';

export const mohammedIndimiProfile: Profile = {
    id: 'mohammed-indimi',
    name: 'Mohammed Indimi',
    personaType: PersonaType.PERSON,
    personSubtype: PersonSubtype.NOTABLE_PERSON,
    avatar: 'https://picsum.photos/seed/indimi/96/96',
    title: 'Businessman & Philanthropist',
    description: 'Founder and chairman of Oriental Energy Resources, a privately-held Nigerian oil exploration and production company.',
    dateOfBirth: '1947-08-12',
    profession: 'Businessman',
    stateOfOrigin: 'Borno State',
    careerHighlights: [
        'Started his business career in the 1960s trading hides and skins.',
        'Ventured into the oil and gas sector in 1991, founding Oriental Energy Resources.',
        'Oriental Energy secured its first oil prospecting license (OPL 224) and has since grown into a major indigenous oil producer.',
        'Known for his extensive philanthropic work, particularly in Borno state, through the Mohammed Indimi Foundation.',
    ],
    projects: [
        'Business Venture: Founding and leadership of Oriental Energy Resources, a successful indigenous oil and gas company.',
        'Philanthropy: The Mohammed Indimi Foundation, which has built a 100-unit housing estate for IDPs in Borno.',
        'Philanthropy: Donated a multi-million dollar international business centre to the University of Maiduguri.',
        'Philanthropy: Sponsoring hundreds of students from Borno state on scholarships in Nigeria and abroad.'
    ],
    legacyAndImpact: 'Mohammed Indimi is one of Nigeria\'s most successful indigenous entrepreneurs in the highly competitive oil and gas industry. His company is a testament to local capacity in the sector. His philanthropic contributions have been crucial in addressing the humanitarian crisis in the North-East, funding projects in education, housing, and healthcare for internally displaced persons.',
    awardsAndHonours: [
        'Officer of the Order of the Federal Republic (OFR).',
        'Multiple honorary doctorate degrees from Nigerian universities.',
    ]
};