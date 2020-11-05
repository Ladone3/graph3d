import { SphericalViewController } from './sphericalViewController';
import { ViewControllersSet } from './viewController';
import { CylindricalViewController } from './cylindricalViewController';
import { OpenSpaceViewController } from './openSpaceViewController';
import { VrViewController } from './vrViewController';

export function DEFAULT_VIEW_CONTROLLERS_SET(): ViewControllersSet {
    return [
        (core, mouseHandler, keyHandler) =>
            new SphericalViewController(core, mouseHandler, keyHandler),
        (core, mouseHandler, keyHandler) =>
            new CylindricalViewController(core, mouseHandler, keyHandler),
        (core, mouseHandler, keyHandler) =>
            new OpenSpaceViewController(core, mouseHandler, keyHandler),
        (core, mouseHandler, keyHandler, gamepadHandler) =>
            new VrViewController(core, mouseHandler, keyHandler, gamepadHandler),
    ];
}
