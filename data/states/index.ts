import { Profile } from '../../types';
import { abiaProfile } from './abia';
import { adamawaProfile } from './adamawa';
import { akwaIbomProfile } from './akwa-ibom';
import { anambraProfile } from './anambra';
import { bauchiProfile } from './bauchi';
import { bayelsaProfile } from './bayelsa';
import { benueProfile } from './benue';
import { bornoProfile } from './borno';
import { crossRiverProfile } from './cross-river';
import { deltaProfile } from './delta';
import { ebonyiProfile } from './ebonyi';
import { edoProfile } from './edo';
import { ekitiProfile } from './ekiti';
import { enuguProfile } from './enugu';
import { fctAbujaProfile } from './fct-abuja';
import { gombeProfile } from './gombe';
import { imoProfile } from './imo';
import { jigawaProfile } from './jigawa';
import { kadunaProfile } from './kaduna';
import { kanoProfile } from './kano';
import { katsinaProfile } from './katsina';
import { kebbiProfile } from './kebbi';
import { kogiProfile } from './kogi';
import { kwaraProfile } from './kwara';
import { lagosProfile } from './lagos';
import { nasarawaProfile } from './nasarawa';
import { nigerProfile } from './niger';
import { ogunProfile } from './ogun';
import { ondoProfile } from './ondo';
import { osunProfile } from './osun';
import { oyoProfile } from './oyo';
import { plateauProfile } from './plateau';
import { riversProfile } from './rivers';
import { sokotoProfile } from './sokoto';
import { tarabaProfile } from './taraba';
import { yobeProfile } from './yobe';
import { zamfaraProfile } from './zamfara';


const allStateProfiles: Profile[] = [
    abiaProfile,
    adamawaProfile,
    akwaIbomProfile,
    anambraProfile,
    bauchiProfile,
    bayelsaProfile,
    benueProfile,
    bornoProfile,
    crossRiverProfile,
    deltaProfile,
    ebonyiProfile,
    edoProfile,
    ekitiProfile,
    enuguProfile,
    fctAbujaProfile,
    gombeProfile,
    imoProfile,
    jigawaProfile,
    kadunaProfile,
    kanoProfile,
    katsinaProfile,
    kebbiProfile,
    kogiProfile,
    kwaraProfile,
    lagosProfile,
    nasarawaProfile,
    nigerProfile,
    ogunProfile,
    ondoProfile,
    osunProfile,
    oyoProfile,
    plateauProfile,
    riversProfile,
    sokotoProfile,
    tarabaProfile,
    yobeProfile,
    zamfaraProfile,
];

// Sort alphabetically by name
export const stateProfiles: Profile[] = allStateProfiles.sort((a, b) => a.name.localeCompare(b.name));