import { SphericalViewController } from './sphericalViewController';
import { ViewControllersSet } from './viewController';
import { CylindricalViewController } from './cylindricViewController';
import { DiagramView } from '../views/diagramView';
import { OpenSpaceViewController } from './openSpaceViewController';

export interface ViewController {
    setGraphView: (graphView: DiagramView) => void;
    onMouseDown: (event: MouseEvent) => void;
    onMouseWheel: (event: MouseWheelEvent) => void;
    refreshCamera: () => void;
    focusOn: (element: Element) => void;
}

export const DEFAULT_VIEW_CONTROLLERS_SET: ViewControllersSet = [
    (view: DiagramView) => new SphericalViewController(view),
    (view: DiagramView) => new CylindricalViewController(view),
    (view: DiagramView) => new OpenSpaceViewController(view),
];
