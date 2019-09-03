import * as THREE from 'three';
import { GraphModel, Element, isNode } from '../models/graphModel';
import { DiagramElementView } from '.';
import { NodeView } from './nodeView';
import { LinkView } from './linkView';
import {
    NodeTemplateProvider,
    DEFAULT_NODE_TEMPLATE_PROVIDER,
    LinkTemplateProvider,
    DEFAULT_LINK_TEMPLATE_PROVIDER,
    DEFAULT_NODE_TEMPLATE,
    DEFAULT_LINK_TEMPLATE,
} from '../customisation';
import { Subscribable } from '../utils';
import { Link } from '../models/link';
import { Node } from '../models/node';
import { LinkRouter, DefaultLinkRouter } from '../utils/linkRouter';

export interface GraphViewProps {
    graphModel: GraphModel;
    scene: THREE.Scene;
    nodeTemplateProvider?: NodeTemplateProvider;
    linkTemplateProvider?: LinkTemplateProvider;
    simpleLinks?: boolean;
}

export interface GraphViewEvents {
    'overlay:down': {event: MouseEvent; target: Element};
}

export class GraphView extends Subscribable<GraphViewEvents> {
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    views: Map<string, DiagramElementView>;

    renderer: THREE.WebGLRenderer;
    overlayRenderer: THREE.CSS3DRenderer;
    graphModel: GraphModel;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;
    linkRouter: LinkRouter;

    constructor(private props: GraphViewProps) {
        super();
        this.views = new Map();
        this.scene = props.scene;
        this.graphModel = props.graphModel;
        this.linkRouter = new DefaultLinkRouter(props.graphModel);
        this.graphModel.nodes.forEach(node => this.registerElement(node));
        this.graphModel.links.forEach(link => this.registerElement(link));
    }

    public registerElement(element: Element) {
        const elementViewExists = this.views.get(element.id);
        if (elementViewExists) {
            return; // We'v registered the view for this element
        }
        let view: DiagramElementView;
        if (isNode(element)) {
            view = this.createNodeView(element);
        } else {
            view = this.createLinkView(element);
        }
        if (view) {
            if (view.mesh) {
                this.scene.add(view.mesh);
            }
            if (view.overlayAnchor.isVisible()) {
                view.overlayAnchor.html.onmousedown = e => {
                    e.stopPropagation();
                    this.trigger('overlay:down', {event: e, target: element});
                };
                this.scene.add(view.overlayAnchor.getSprite());
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
            if (view.overlayAnchor.isVisible()) {
                this.scene.remove(view.overlayAnchor.getSprite());
            }
        }
        this.views.delete(element.id);
    }

    private createNodeView(node: Node): DiagramElementView {
        const templateProvider =  this.props.nodeTemplateProvider || DEFAULT_NODE_TEMPLATE_PROVIDER;
        const nodeTemplate = {
            ...DEFAULT_NODE_TEMPLATE,
            ...templateProvider(node.types),
        };
        return new NodeView(node, nodeTemplate);
    }

    private createLinkView(link: Link): DiagramElementView | undefined {
        const templateProvider = this.props.linkTemplateProvider || DEFAULT_LINK_TEMPLATE_PROVIDER;
        const linkTemplate = {
            ...DEFAULT_LINK_TEMPLATE,
            ...templateProvider(link.types),
        };
        return new LinkView(link, this.linkRouter, linkTemplate);
    }

    update(specificIds: string[]) {
        const updateView = (elementId: string) => {
            const element = this.graphModel.getElementById(elementId);
            if (element.modelIsChanged) {
                this.removeElementView(element);
                this.registerElement(element);
                element.modelIsChanged = false;
            }
            const view = this.views.get(elementId);
            if (view) { // View is added asynchronously
                view.update();
            }
        };
        if (specificIds) {
            for (const id of specificIds) {
                updateView(id);
            }
        } else {
            specificIds = [];
            this.views.forEach(view => {
                updateView(view.model.id);
            });
        }
    }
}
