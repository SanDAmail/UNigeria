import { Profile, PersonaType } from '../../types';

export const fctAbujaProfile: Profile = {
    id: 'fct-abuja',
    name: 'FCT (Abuja)',
    personaType: PersonaType.STATE, // Using STATE persona for consistency in UI handling
    avatar: 'https://picsum.photos/seed/abuja/96/96',
    slogan: 'Centre of Unity',
    demonym: 'Abuja Resident',
    region: 'North Central',
    description: 'The capital of Nigeria, a planned city built in the 1980s. It is the administrative and political center of the country.',
    sections: [],
    capital: 'Abuja',
    dateCreated: '1976-02-03',
    governor: 'Nyesom Wike (FCT Minister)', // Note: FCT is administered by a Minister
    website: 'fcta.gov.ng',
    majorEthnicGroups: ['A diverse mix of all Nigerian ethnic groups'],
    landArea: '7,315 sq km',
    gdp: 'Approx. $6 Billion',
    literacyRate: '90%',
    population: 'Approx. 4 million',
    lgas: 6, // Area Councils
    naturalResources: ['Marble', 'Clay', 'Talc', 'Dolomite'],
    majorIndustries: ['Public Administration', 'Real Estate & Construction', 'Services', 'Retail', 'Tourism & Hospitality'],
    notableSites: ['Aso Rock', 'Zuma Rock (on border)', 'Nigerian National Mosque', 'National Christian Centre', 'Millennium Park', 'Jabi Lake'],
    universities: ['University of Abuja', 'Nigerian Turkish Nile University', 'Baze University', 'Veritas University']
};