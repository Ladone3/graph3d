import { ViewControllersSet } from './viewController';
import { DiagramView } from '../views/diagramView';
export interface ViewController {
    setGraphView: (graphView: DiagramView) => void;
    onMouseDown: (event: MouseEvent) => void;
    onMouseWheel: (event: MouseWheelEvent) => void;
    refreshCamera: () => void;
    focusOn: (element: Element) => void;
}
export declare const DEFAULT_VIEW_CONTROLLERS_SET: ViewControllersSet;
