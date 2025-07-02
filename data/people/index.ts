

import { Profile, PersonSubtype } from '../../types';
// Import from state-based directories
import { abiaPeople } from '../states/abia/people';
import { adamawaPeople } from '../states/adamawa/people';
import { akwaIbomPeople } from '../states/akwa-ibom/people';
import { anambraPeople } from '../states/anambra/people';
import { bauchiPeople } from '../states/bauchi/people';
import { bayelsaPeople } from '../states/bayelsa/people';
import { benuePeople } from '../states/benue/people';
import { bornoPeople } from '../states/borno/people';
import { crossRiverPeople } from '../states/cross-river/people';
import { deltaPeople } from '../states/delta/people';
import { ebonyiPeople } from '../states/ebonyi/people';
import { edoPeople } from '../states/edo/people';
import { ekitiPeople } from '../states/ekiti/people';
import { enuguPeople } from '../states/enugu/people';
import { gombePeople } from '../states/gombe/people';
import { imoPeople } from '../states/imo/people';
import { jigawaPeople } from '../states/jigawa/people';
import { kadunaPeople } from '../states/kaduna/people';
import { kanoPeople } from '../states/kano/people';
import { katsinaPeople } from '../states/katsina/people';
import { kebbiPeople } from '../states/kebbi/people';
import { kogiPeople } from '../states/kogi/people';
import { kwaraPeople } from '../states/kwara/people';
import { lagosPeople } from '../states/lagos/people';
import { nasarawaPeople } from '../states/nasarawa/people';
import { nigerPeople } from '../states/niger/people';
import { ogunPeople } from '../states/ogun/people';
import { ondoPeople } from '../states/ondo/people';
import { osunPeople } from '../states/osun/people';
import { oyoPeople } from '../states/oyo/people';
import { plateauPeople } from '../states/plateau/people';
import { riversPeople } from '../states/rivers/people';
import { sokotoPeople } from '../states/sokoto/people';
import { tarabaPeople } from '../states/taraba/people';
import { yobePeople } from '../states/yobe/people';
import { zamfaraPeople } from '../states/zamfara/people';


// Import non-state specific profiles
import { notablePeopleProfiles as generalNotablePeople } from './notable-people';


export const peopleProfiles: Profile[] = [
    ...abiaPeople,
    ...adamawaPeople,
    ...akwaIbomPeople,
    ...anambraPeople,
    ...bauchiPeople,
    ...bayelsaPeople,
    ...benuePeople,
    ...bornoPeople,
    ...crossRiverPeople,
    ...deltaPeople,
    ...ebonyiPeople,
    ...edoPeople,
    ...ekitiPeople,
    ...enuguPeople,
    ...gombePeople,
    ...imoPeople,
    ...jigawaPeople,
    ...kadunaPeople,
    ...kanoPeople,
    ...katsinaPeople,
    ...kebbiPeople,
    ...kogiPeople,
    ...kwaraPeople,
    ...lagosPeople,
    ...nasarawaPeople,
    ...nigerPeople,
    ...ogunPeople,
    ...ondoPeople,
    ...osunPeople,
    ...oyoPeople,
    ...plateauPeople,
    ...riversPeople,
    ...sokotoPeople,
    ...tarabaPeople,
    ...yobePeople,
    ...zamfaraPeople,
    ...generalNotablePeople, // This will contain profiles like Adaeze without a state
].sort((a, b) => {
    // If both are former leaders, sort by termEndDate descending
    if (a.personSubtype === PersonSubtype.FORMER_LEADER && b.personSubtype === PersonSubtype.FORMER_LEADER) {
        // Handle cases where date might be missing
        const dateA = a.termEndDate || '0';
        const dateB = b.termEndDate || '0';
        return dateB.localeCompare(dateA); // Newest first
    }
    
    // Original sorting for other subtypes
    if (a.personSubtype === b.personSubtype) {
        return a.name.localeCompare(b.name);
    }
    return (a.personSubtype || '').localeCompare(b.personSubtype || '');
});