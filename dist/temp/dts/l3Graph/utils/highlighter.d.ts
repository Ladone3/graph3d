import { DiagramView } from '../views/diagramView';
import { Element } from '../models/graph/graphModel';
export declare type Highlighter = (mesh: THREE.Object3D) => (mesh: THREE.Object3D) => void;
export declare class ElementHighlighter {
    private diagramView;
    private highlighter;
    private restorers;
    constructor(diagramView: DiagramView, highlighter?: Highlighter);
    highlight(element: Element): void;
    clear(element: Element): void;
}
