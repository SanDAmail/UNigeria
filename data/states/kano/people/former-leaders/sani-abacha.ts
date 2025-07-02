import { Profile, PersonaType, PersonSubtype } from '../../../../../types';

export const saniAbachaProfile: Profile = {
    id: 'sani-abacha',
    name: 'Sani Abacha',
    personaType: PersonaType.PERSON,
    personSubtype: PersonSubtype.FORMER_LEADER,
    avatar: 'https://picsum.photos/seed/abacha/96/96',
    title: 'Former Military Head of State',
    description: 'Former Military Head of State of Nigeria (1993-1998), whose regime was known for its authoritarianism.',
    dateOfBirth: '1943-09-20',
    termEndDate: '1998-06-08',
    profession: 'Military General',
    stateOfOrigin: 'Kano State',
    careerHighlights: [
        'Fought in the Nigerian Civil War.',
        'Played a key role in the 1983 and 1985 military coups.',
        'Served as Chief of Army Staff and later Minister of Defence.',
        'Seized power in a 1993 coup, overthrowing the short-lived interim government.',
        'Established the Petroleum Trust Fund (PTF).',
        'His regime was marked by significant human rights abuses and the suppression of political opposition.',
    ],
    projects: [
        'Establishment of the Petroleum Trust Fund (PTF), which undertook widespread infrastructure projects.',
        'Rehabilitation of thousands of kilometers of federal roads across all six geopolitical zones via the PTF.',
        'Intervention in the health sector through the PTF, including drug revolving funds and rehabilitation of hospitals.',
        'Rehabilitation of educational institutions and provision of instructional materials through the PTF.',
        'Establishment of the National Hospital in Abuja.',
        'Water supply projects in various cities and rural areas funded by the PTF.',
    ],
    legacyAndImpact: "Abacha's rule is widely regarded as one of the most brutal and corrupt in Nigeria's history. His government executed political activists, including Ken Saro-Wiwa, leading to Nigeria's suspension from the Commonwealth. Economically, his era saw some stability and infrastructure development through the PTF, but it is overwhelmingly overshadowed by the extensive looting of state funds, with billions of dollars being traced to his family and associates and gradually repatriated to Nigeria years after his death.",
    awardsAndHonours: [
        'Grand Commander of the Order of the Federal Republic (GCFR).',
    ]
};