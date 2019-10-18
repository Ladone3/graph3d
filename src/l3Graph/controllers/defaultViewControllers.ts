import { SphericalViewController } from './sphericalViewController';
import { ViewControllersSet } from './viewController';
import { CylindricalViewController } from './cylindricViewController';
import { OpenSpaceViewController } from './openSpaceViewController';
import { VrViewController } from './vrViewController';

export const DEFAULT_VIEW_CONTROLLERS_SET: ViewControllersSet = [
    (view, mouseHandler, keyHandler) =>
        new SphericalViewController(view, mouseHandler, keyHandler),
    (view, mouseHandler, keyHandler) =>
        new CylindricalViewController(view, mouseHandler, keyHandler),
    (view, mouseHandler, keyHandler) =>
        new OpenSpaceViewController(view, mouseHandler, keyHandler),
    (view, mouseHandler, keyHandler) =>
        new VrViewController(view, mouseHandler, keyHandler),
];
