import { Profile, PersonaType, PersonSubtype } from '../../../../../types';

export const abubakarGumiProfile: Profile = {
    id: 'abubakar-gumi',
    name: 'Abubakar Gumi',
    personaType: PersonaType.PERSON,
    personSubtype: PersonSubtype.NOTABLE_PERSON,
    avatar: 'https://picsum.photos/seed/gumi/96/96',
    title: 'Islamic Scholar',
    description: 'A highly influential and controversial Islamic scholar who was the first Grand Khadi of the Northern Region of Nigeria.',
    dateOfBirth: '1922-11-07',
    profession: 'Cleric, Jurist, Scholar',
    stateOfOrigin: 'Kaduna State', // Associated with Kaduna, though from Gummi in modern Zamfara
    careerHighlights: [
        'Served as the Grand Khadi of the Northern Region (1962-1967).',
        'A leading figure in the Izala Society (JIBWIS), a Salafist-inspired Islamic movement.',
        'Translated the Qur\'an into the Hausa language.',
        'A vocal public commentator on religious and political issues for decades.',
        'Received the King Faisal International Prize for services to Islam in 1987.',
    ],
    projects: [
        'Religious Movement: Founding figure of the Jama\'atu Izalatil Bid\'ah wa Iqamatus Sunnah (JIBWIS), also known as the Izala Society, a major Islamic reform movement in West Africa.',
        'Literary/Religious Work: The first translation of the Holy Qur\'an into the Hausa language, making it accessible to millions.',
        'Broadcasting: Pioneered Islamic preaching on radio and television in Northern Nigeria.',
        'Education: Established schools and educational programs focused on his interpretation of Islamic teachings.'
    ],
    legacyAndImpact: 'Sheikh Gumi was one of the most powerful and influential Islamic scholars in 20th-century Nigeria. His teachings and the Izala movement he championed profoundly reshaped Islamic practice in Northern Nigeria, challenging the dominance of the Sufi brotherhoods. He was a controversial figure, often criticized for his hardline views, but his influence on religious thought and practice in the region is undeniable.',
    awardsAndHonours: [
        'King Faisal International Prize (1987).',
        'Commander of the Order of the Federal Republic (CFR).',
    ]
};