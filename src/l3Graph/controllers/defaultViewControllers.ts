import { SphericalViewController } from './sphericalViewController';
import { ViewControllersSet } from './viewController';
import { CylindricalViewController } from './cylindricViewController';
import { DiagramView } from '../views/diagramView';
import { OpenSpaceViewController } from './openSpaceViewController';
import { MouseHandler } from '../utils/mouseHandler';
import { KeyHandler } from '../utils';
import { VrViewController } from './vrViewController';

export const DEFAULT_VIEW_CONTROLLERS_SET: ViewControllersSet = [
    (view: DiagramView, mouseHandler: MouseHandler, keyHandler: KeyHandler) =>
        new SphericalViewController(view, mouseHandler, keyHandler),
    (view: DiagramView, mouseHandler: MouseHandler, keyHandler: KeyHandler) =>
        new CylindricalViewController(view, mouseHandler, keyHandler),
    (view: DiagramView, mouseHandler: MouseHandler, keyHandler: KeyHandler) =>
        new OpenSpaceViewController(view, mouseHandler, keyHandler),
    (view: DiagramView, mouseHandler: MouseHandler, keyHandler: KeyHandler) =>
        new VrViewController(view, mouseHandler, keyHandler),
];
