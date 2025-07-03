import { Profile, PersonaType, PersonSubtype } from '../../../../../types';

export const namadiSamboProfile: Profile = {
    id: 'namadi-sambo',
    name: 'Namadi Sambo',
    personaType: PersonaType.PERSON,
    personSubtype: PersonSubtype.NOTABLE_PERSON,
    avatar: 'https://picsum.photos/seed/sambo/96/96',
    title: 'Architect & Former Vice President',
    description: 'An architect who served as Governor of Kaduna State and later as the Vice President of Nigeria.',
    dateOfBirth: '1954-08-02',
    profession: 'Architect, Politician',
    stateOfOrigin: 'Kaduna State',
    careerHighlights: [
        'Graduated with a Masters degree in Architecture from Ahmadu Bello University, Zaria.',
        'Worked in private practice and as a public servant in the Kaduna State government.',
        'Elected as the Governor of Kaduna State in 2007.',
        'Appointed as the Vice President of Nigeria by President Goodluck Jonathan in 2010, serving until 2015.',
    ],
    projects: [
        'Governance: As Governor of Kaduna, he initiated projects focused on security, power, and infrastructure.',
        'Economic Management: As Vice President, he chaired the National Economic Council, overseeing economic policy coordination.',
        'Power Sector Reform: Chaired the board of the Niger Delta Power Holding Company (NDPHC), playing a key role in the implementation of the National Integrated Power Projects (NIPP).',
        'Privatization: Deeply involved in the privatization of the power sector as chairman of the Presidential Task Force on Power.'
    ],
    legacyAndImpact: 'As governor, Sambo was known for his focus on security and infrastructure. As Vice President, he chaired the National Economic Council and was involved in the implementation of the government\'s "Transformation Agenda," particularly in the power sector. He is generally seen as a calm and steady political figure.',
    awardsAndHonours: [
        'Grand Commander of the Order of the Niger (GCON).',
        'Fellow of the Nigerian Institute of Architects (FNIA).'
    ]
};