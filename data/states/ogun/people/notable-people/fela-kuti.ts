import { Profile, PersonaType, PersonSubtype } from '../../../../../types';

export const felaKutiProfile: Profile = {
    id: 'fela-kuti',
    name: 'Fela Kuti',
    personaType: PersonaType.PERSON,
    personSubtype: PersonSubtype.NOTABLE_PERSON,
    avatar: 'https://picsum.photos/seed/fela/96/96',
    title: 'Musician & Activist',
    description: 'A Nigerian multi-instrumentalist, bandleader, composer, political activist, and the pioneer of the Afrobeat music genre.',
    dateOfBirth: '1938-10-15',
    profession: 'Musician',
    stateOfOrigin: 'Ogun State',
    careerHighlights: [
        'Created the Afrobeat genre, a complex fusion of jazz, funk, psychedelic rock, and traditional West African chants and rhythms.',
        'Formed several bands, most famously Africa \'70 and later Egypt \'80.',
        'Established the Kalakuta Republic, a commune and recording studio that he declared independent from Nigeria.',
        'Used his music as a political weapon to criticize military dictatorships, corruption, and colonialism.',
        'His music and activism made him a global icon and a target of the Nigerian government, leading to numerous arrests and raids.',
    ],
    projects: [
        'Musical Innovation: The creation and popularization of the Afrobeat music genre.',
        'Artistic Venture: Formation and leadership of his iconic bands, Africa \'70 and Egypt \'80.',
        'Cultural Hub: Establishment of The Afrika Shrine, a vibrant nightclub and performance venue.',
        'Social Experiment: The Kalakuta Republic, a commune that served as a home for his family, band members, and a recording studio.',
        'Political Movement: Creation of his own political party, Movement of the People (MOP).'
    ],
    legacyAndImpact: 'Fela Kuti is one of the most influential musicians to ever come out of Africa. His Afrobeat sound has influenced countless artists worldwide across many genres. His outspoken political activism and "voice of the voiceless" stance made him a cultural icon and a symbol of resistance against oppression. The Broadway musical "Fela!" celebrates his life and work.',
    awardsAndHonours: [
        'Posthumously inducted into the Rock and Roll Hall of Fame.',
    ],
    notableQuotes: [
        "Music is the weapon of the future.",
        "My people are suffering and dying, and you want me to sing about love?",
    ]
};