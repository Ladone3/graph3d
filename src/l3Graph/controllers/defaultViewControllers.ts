import { SphericalViewController } from './sphericalViewController';
import { ViewControllersSet } from './viewController';
import { CylindricalViewController } from './cylindricViewController';
import { OpenSpaceViewController } from './openSpaceViewController';
import { VrViewController } from './vrViewController';
import { GraphDescriptor } from '../models/graph/graphDescriptor';

export function DEFAULT_VIEW_CONTROLLERS_SET<Descriptor extends GraphDescriptor>(): ViewControllersSet<Descriptor> {
    return [
        (view, mouseHandler, keyHandler) =>
            new SphericalViewController(view, mouseHandler, keyHandler),
        (view, mouseHandler, keyHandler) =>
            new CylindricalViewController(view, mouseHandler, keyHandler),
        (view, mouseHandler, keyHandler) =>
            new OpenSpaceViewController(view, mouseHandler, keyHandler),
        (view, mouseHandler, keyHandler, gamepadHandler) =>
            new VrViewController(view, mouseHandler, keyHandler, gamepadHandler),
    ];
}
