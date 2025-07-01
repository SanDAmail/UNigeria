import { Profile, PersonaType, PersonSubtype } from '../../../../../types';

export const bolaTinubuProfile: Profile = {
    id: 'bola-tinubu',
    name: 'Bola Ahmed Tinubu',
    personaType: PersonaType.PERSON,
    personSubtype: PersonSubtype.CURRENT_LEADER,
    avatar: 'https://picsum.photos/seed/tinubu/96/96',
    title: 'President of Nigeria',
    description: 'Current President of Nigeria and former Governor of Lagos State, a key political figure in the nation for decades.',
    dateOfBirth: '1952-03-29',
    profession: 'Politician & Accountant',
    stateOfOrigin: 'Lagos State',
    earlyLifeAndEducation: 'Tinubu studied in the United States, first at Richard J. Daley College in Chicago and then at Chicago State University, where he graduated in 1979 with a Bachelor of Science degree in Accounting.',
    careerHighlights: [
        'Worked for American companies Arthur Andersen, Deloitte, Haskins, & Sells, and GTE Services Corporation.',
        'Joined Mobil Oil Nigeria in 1983, where he later became a company executive.',
        'Elected as a senator for the Lagos West constituency in 1992.',
        'Served as the Governor of Lagos State from 1999 to 2007.',
        'Became a national leader of the All Progressives Congress (APC) party.',
        'Elected as the 16th President of the Federal Republic of Nigeria in 2023.',
    ],
    legacyAndImpact: 'As Governor of Lagos, Tinubu is credited with initiating major reforms in financial management, infrastructure, and governance that laid the groundwork for the state\'s modern development. As a political strategist, he was instrumental in the formation of the APC, which unseated an incumbent party for the first time in Nigeria\'s history in 2015. His presidency began with significant economic reforms, including the removal of the fuel subsidy.',
    awardsAndHonours: [
        'Grand Commander of the Order of the Federal Republic (GCFR) - Nigeria\'s highest national honour (as President).',
        'Chief of the Order of the Niger (CON) - Awarded during his time as governor.',
        'Holds numerous traditional chieftaincy titles across Nigeria.',
    ],
    notableQuotes: [
        "It is my turn. (Emilokan)",
        "A town hall different from balderdash.",
        "Let the poor breathe; don't suffocate them.",
    ]
};
