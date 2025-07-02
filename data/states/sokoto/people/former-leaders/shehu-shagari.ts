import { Profile, PersonaType, PersonSubtype } from '../../../../../types';

export const shehuShagariProfile: Profile = {
    id: 'shehu-shagari',
    name: 'Shehu Shagari',
    personaType: PersonaType.PERSON,
    personSubtype: PersonSubtype.FORMER_LEADER,
    avatar: 'https://picsum.photos/seed/shagari/96/96',
    title: 'Former President of Nigeria',
    description: 'First democratically elected President of Nigeria in the Second Republic (1979-1983).',
    dateOfBirth: '1925-02-25',
    termEndDate: '1983-12-31',
    profession: 'Educator, Politician',
    stateOfOrigin: 'Sokoto State',
    careerHighlights: [
        'Worked as a teacher and school administrator for many years.',
        'Served as a federal minister and commissioner multiple times in the First Republic.',
        'Elected President of Nigeria in 1979 and re-elected in 1983.',
        'His administration focused on housing, industrialization, and agriculture, known as the "Green Revolution".',
        'His government was overthrown in a military coup led by Major General Muhammadu Buhari in December 1983.',
    ],
    projects: [
        'Launched the Green Revolution program to boost agricultural production and reduce food imports.',
        'Initiated a massive national housing program, constructing federal housing estates in all states.',
        'Advanced the construction of the new Federal Capital Territory, Abuja.',
        'Promoted the development of the Ajaokuta Steel Complex and other steel rolling mills in Katsina, Jos, and Osogbo.',
        'Established several federal universities of technology.',
    ],
    legacyAndImpact: "Shagari's presidency represented Nigeria's return to democracy after 13 years of military rule. His government is remembered for its focus on large-scale development projects, particularly in housing and agriculture. However, his tenure was also plagued by a global oil glut that severely impacted Nigeria's economy, as well as widespread accusations of corruption among his political associates. His overthrow marked the end of Nigeria's Second Republic.",
    awardsAndHonours: [
        'Grand Commander of the Order of the Federal Republic (GCFR).',
    ]
};