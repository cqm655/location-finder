import Firefighter from '../assets/fire-truck.png';
import Police from '../assets/police-car.png';
import Ambulance from '../assets/ambulance.png';

export const getSsuIconType = (caseTypeId?: number) => {
    switch (caseTypeId) {
        case 102:
            return Police;
            break;
        case 104:
            return Firefighter;
            break;
        case 105:
            return Ambulance;
            break;
    }
}
