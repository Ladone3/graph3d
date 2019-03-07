import * as THREE from 'three';
import { GraphModel, Element, isNode, isLink } from '../models/graphModel';
import { DiagramElementView } from './diagramElementView';
import { NodeView } from './nodeView';
import { LinkView } from './linkView';
import {
    NodeTemplateProvider,
    DEFAULT_NODE_TEMPLATE_PROVIDER,
    LinkTemplateProvider,
    DEFAULT_LINK_TEMPLATE_PROVIDER,
} from '../templates';

export interface GraphViewProps {
    graphModel: GraphModel;
    scene: THREE.Scene;
    nodeTemplateProvider?: NodeTemplateProvider;
    linkTemplateProvider?: LinkTemplateProvider;
}

export class GraphView {
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    views: Map<string, DiagramElementView<Element>>;

    renderer: THREE.WebGLRenderer;
    overlayRenderer: THREE.CSS3DRenderer;
    graphModel: GraphModel;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;

    constructor(private props: GraphViewProps) {
        this.views = new Map();
        this.scene = props.scene;
        this.graphModel = props.graphModel;
        this.graphModel.nodes.forEach(node => this.addElementView(node));
        this.graphModel.links.forEach(link => this.addElementView(link));
    }

    public addElementView(element: Element) {
        const view = this.findViewForElement(element);

        if (view) {
            const mesh = view.mesh;
            if (mesh) {
                this.scene.add(mesh);
            }

            const overlay = view.overlay;
            if (overlay) {
                this.scene.add(overlay);
            }
            this.views.set(element.id, view);
        }
    }

    public removeElementView(element: Element) {
        const view = this.views.get(element.id);

        if (view) {
            if (view.mesh) {
                this.scene.remove(view.mesh);
            }

            if (view.overlay) {
                this.scene.remove(view.overlay);
            }
        }
    }

    private findViewForElement(model: Element): DiagramElementView<Element> | undefined {
        if (isNode(model)) {
            const templateProvider =  this.props.nodeTemplateProvider || DEFAULT_NODE_TEMPLATE_PROVIDER;
            return new NodeView(model, templateProvider(model.types));
        } else if (isLink(model)) {
            const templateProvider = this.props.linkTemplateProvider || DEFAULT_LINK_TEMPLATE_PROVIDER;
            return new LinkView(model, templateProvider(model.types));
        } else {
            return undefined;
        }
    }

    update(specificIds: string[]) {
        // const selection = this
        const updateView = (elementId: string) => {
            if (this.graphModel.fullUpdateList.has(elementId)) {
                const element = this.graphModel.getElementById(elementId);
                this.removeElementView(element);
                this.addElementView(element);
            }
            const view = this.views.get(elementId);
            view.update();
        };
        if (!specificIds) {
            specificIds = [];
            this.views.forEach(view => {
                specificIds.push(view.model.id);
            });
        }
        for (const id of specificIds) {
            updateView(id);
        }
        this.graphModel.fullUpdateList.clear();
    }
}
