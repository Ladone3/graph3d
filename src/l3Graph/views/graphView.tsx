import * as THREE from 'three';
import { GraphModel, Element, isNode, isLink } from '../models/graphModel';
import { DiagramElementView } from './diagramElementView';
import { NodeView } from './nodeView';
import { LinkView } from './linkView';
import { LinkViewTemplate, NodeViewTemplate } from '../templates';

export interface GraphViewProps {
    graphModel: GraphModel;
    scene: THREE.Scene;
    nodeTemplates: {[typeId: string]: NodeViewTemplate };
    linkTemplates: {[typeId: string]: LinkViewTemplate };
}

export class GraphView {
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    views: Map<string, DiagramElementView>;

    renderer: THREE.WebGLRenderer;
    overlayRenderer: THREE.CSS3DRenderer;
    graphModel: GraphModel;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;

    constructor(private props: GraphViewProps) {
        this.views = new Map();
        this.graphModel = props.graphModel;
        this.scene = props.scene;
        this.subscribeOnModel();
    }

    private subscribeOnModel() {
        this.graphModel.on('add:elements', event => {
            for (const element of event.data) {
                this.addElementView(element);
            }
        });
        this.graphModel.on('remove:elements', event => {
            for (const element of event.data) {
                this.removeElementView(element);
            }
        });
    }

    private addElementView(element: Element) {
        const view = this.findViewForElement(element);

        if (view) {
            const mesh = view.getMesh();
            if (mesh) {
                this.scene.add(mesh);
            }

            const overlay = view.getOverlay();
            if (overlay) {
                this.scene.add(overlay);
            }
            this.views.set(element.id, view);
        }
    }

    private removeElementView(element: Element) {
        const view = this.views.get(element.id);

        if (view) {
            const mesh = view.getMesh();
            if (mesh) {
                this.scene.remove(mesh);
            }

            const overlay = view.getOverlay();
            if (overlay) {
                this.scene.remove(overlay);
            }
        }
    }

    private findViewForElement(model: Element): DiagramElementView | undefined {
        if (isNode(model)) {
            let template: NodeViewTemplate<any>;
            if (this.props.nodeTemplates) {
                for (const type of model.types) {
                    template =  this.props.nodeTemplates[type];
                    if (template) {
                        break;
                    }
                }
            }
            return new NodeView(model, template);
        } else if (isLink(model)) {
            let template: LinkViewTemplate;
            for (const type of model.types) {
                template =  this.props.linkTemplates[type];
                if (template) {
                    break;
                }
            }
            return new LinkView(model, template);
        } else {
            return undefined;
        }
    }

    update(specificIds?: string[]) {
        if (specificIds) {
            for (const id of specificIds) {
                this.views.get(id).update();
            }
        } else {
            this.views.forEach(view => {
                view.update();
            });
        }
    }
}
