import { DiagramView } from '../views/diagramView';

export interface ViewController {
    id: string;
    label: string;
    onKeyPressed: (event: Set<number>) => void;
    onMouseDown: (event: MouseEvent) => void;
    onMouseWheel: (event: MouseWheelEvent) => void;
    refreshCamera: () => void;
    focusOn: (element: Element) => void;
}

export type ViewControllersSet = ((view: DiagramView) => ViewController)[];
