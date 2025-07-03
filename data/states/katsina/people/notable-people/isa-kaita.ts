import { Profile, PersonaType, PersonSubtype } from '../../../../../types';

export const isaKaitaProfile: Profile = {
    id: 'isa-kaita',
    name: 'Isa Kaita',
    personaType: PersonaType.PERSON,
    personSubtype: PersonSubtype.NOTABLE_PERSON,
    avatar: 'https://picsum.photos/seed/isakaita/96/96',
    title: 'Statesman & Politician',
    description: 'A pre-eminent Northern Nigerian statesman who played a key role in the politics of the First Republic.',
    dateOfBirth: '1912-01-01',
    profession: 'Politician, Administrator',
    stateOfOrigin: 'Katsina State',
    careerHighlights: [
        'One of the first Northern Nigerians to be educated at the Katsina Training College (Barewa College).',
        'Served as a minister in the Northern Region government for Works and later Education.',
        'A founding member of the Northern People\'s Congress (NPC).',
        'Became the first chairman of the Code of Conduct Bureau in 1980.',
    ],
    projects: [
        'Policy Initiative: As Minister of Education, he oversaw the rapid expansion of primary and secondary education across the Northern Region.',
        'Infrastructure: As Minister of Works, he supervised the development of key roads and public buildings in the region.',
        'Institutional Development: Founding Chairman of the Code of Conduct Bureau, establishing the framework for public service ethics in the Second Republic.'
    ],
    legacyAndImpact: 'Isa Kaita was a pivotal figure in the development of Northern Nigeria, both before and after independence. As Minister of Education, he championed the expansion of educational opportunities in the region. He was widely respected as a principled and disciplined leader, and his role in the First Republic was crucial to the political fabric of the time.',
    awardsAndHonours: [
        'Commander of the Order of the British Empire (CBE).',
        'Commander of the Order of the Federal Republic (CFR).',
    ]
};