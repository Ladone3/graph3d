import { DiagramView } from '../views/diagramView';
import { Element } from '../models/graph/graphModel';
import { Node } from '../models/graph/node';
import { backupColors, setColor, restoreColors } from '.';

export type Highlighter = (mesh: THREE.Object3D) => (mesh: THREE.Object3D) => void;

const SELECTION_COLOR = 'red';

const DEFAULT_HIGHLIGHTER = (mesh: THREE.Object3D) => {
    const backUp = backupColors(mesh);
    setColor(mesh, SELECTION_COLOR);
    return (meshToRestore: THREE.Object3D) => restoreColors(meshToRestore, backUp);
};

export class ElementHighlighter {
    private restorers = new Map<Element, (mesh: THREE.Object3D) => void>();
    constructor(
        private diagramView: DiagramView,
        private highlighter: Highlighter = DEFAULT_HIGHLIGHTER
    ) {}

    highlight(element: Element) {
        if (element instanceof Node && !this.restorers.has(element)) {
            const elementView = this.diagramView.graphView.nodeViews.get(element);
            this.restorers.set(element, this.highlighter(elementView.mesh));
        }
    }

    clear(element: Element) {
        const restore = this.restorers.get(element);
        if (restore) {
            if (element instanceof Node) {
                const elementView = this.diagramView.graphView.nodeViews.get(element);
                restore(elementView.mesh);
                this.restorers.delete(element);
            }
        }
    }
}
