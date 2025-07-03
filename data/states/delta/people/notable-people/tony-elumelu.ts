import { Profile, PersonaType, PersonSubtype } from '../../../../../types';

export const tonyElumeluProfile: Profile = {
    id: 'tony-elumelu',
    name: 'Tony Elumelu',
    personaType: PersonaType.PERSON,
    personSubtype: PersonSubtype.NOTABLE_PERSON,
    avatar: 'https://picsum.photos/seed/elumelu/96/96',
    title: 'Economist, Entrepreneur, Philanthropist',
    description: 'An influential figure in African business, known for his philosophy of "Africapitalism".',
    dateOfBirth: '1963-03-22',
    profession: 'Banker, Investor',
    stateOfOrigin: 'Delta State',
    careerHighlights: [
        'Led a small group of investors to take over a distressed Standard Trust Bank in 1997 and turned it around.',
        'Engineered the merger of Standard Trust Bank and United Bank for Africa (UBA), creating one of Africa\'s largest financial services groups.',
        'Served as Group Managing Director of UBA until his retirement in 2010.',
        'Founded Heirs Holdings, a family-owned investment company.',
        'Established The Tony Elumelu Foundation (TEF), which has pledged $100 million to empower 10,000 African entrepreneurs.',
    ],
    projects: [
        'Business Venture: Leadership of United Bank for Africa (UBA) and its expansion into a pan-African financial institution.',
        'Investment Vehicle: Founding of Heirs Holdings, a proprietary investment company with interests in power, oil & gas, healthcare, and hospitality.',
        'Philanthropy: The Tony Elumelu Foundation, a leading philanthropic initiative empowering entrepreneurs across all 54 African countries.',
        'Power Sector: Investment in power generation through Transcorp Power.'
    ],
    legacyAndImpact: 'Tony Elumelu is a leading proponent of "Africapitalism," the belief that Africa’s private sector can and must play a leading role in the continent’s development. Through his foundation, he has institutionalized this philosophy by creating a platform that provides funding, mentorship, and training for young entrepreneurs across all 54 African countries, making a significant impact on job creation and economic growth.',
    awardsAndHonours: [
        'Commander of the Order of the Niger (CON).',
        'Member of the Order of the Federal Republic (MFR).',
        'Forbes Africa Person of the Year (2020).',
    ],
    notableQuotes: [
        "Nobody is going to develop Africa except us.",
        "Poverty is not a virtue. We need to create wealth.",
    ]
};