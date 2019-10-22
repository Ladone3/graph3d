import * as THREE from 'three';
import { GraphModel, Element } from '../../models/graph/graphModel';
import { NodeView } from './nodeView';
import { LinkView } from './linkView';
import {
    NodeTemplateProvider,
    DEFAULT_NODE_TEMPLATE_PROVIDER,
    LinkTemplateProvider,
    DEFAULT_LINK_TEMPLATE_PROVIDER,
    DEFAULT_NODE_TEMPLATE,
    DEFAULT_LINK_TEMPLATE,
} from '../../customisation';
import { Subscribable } from '../../utils';
import { Link } from '../../models/graph/link';
import { Node } from '../../models/graph/node';
import { LinkRouter, DefaultLinkRouter } from '../../utils/linkRouter';
import { DiagramElementView } from '../viewInterface';
import { VrManager } from '../../vrUtils/vrManager';
import { AbstracrOverlayAnchor3d } from './overlay3DAnchor';

export interface GraphViewProps {
    graphModel: GraphModel;
    vrManager: VrManager;
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
    anchors3d: AbstracrOverlayAnchor3d<any, any>[];

    renderer: THREE.WebGLRenderer;
    overlayRenderer: THREE.CSS3DRenderer;
    graphModel: GraphModel;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;
    linkRouter: LinkRouter;

    vrManager: VrManager;

    constructor(private props: GraphViewProps) {
        super();
        this.views = new Map();
        this.scene = props.scene;
        this.graphModel = props.graphModel;
        this.linkRouter = new DefaultLinkRouter();
        this.graphModel.nodes.forEach(node => this.registerElement(node));
        this.graphModel.links.forEach(link => this.registerElement(link));
        this.anchors3d = [];
        this.vrManager = props.vrManager;
        this.vrManager.on('presenting:state:changed', () => {
            if (this.vrManager.isStarted) {
                this.anchors3d.forEach((sprite) => this.scene.add(sprite.mesh));
            } else {
                this.anchors3d.forEach((sprite) => this.scene.remove(sprite.mesh));
            }
        })
    }

    public registerElement(element: Element) {
        const elementViewExists = this.views.get(element.id);
        if (elementViewExists) {
            return; // We'v registered the view for this element
        }
        let view: DiagramElementView;
        if (element instanceof Node) {
            view = this.createNodeView(element);
        } else {
            view = this.createLinkView(element);
        }
        if (view) {
            if (view.mesh) {
                this.scene.add(view.mesh);
            }
            if (view.overlayAnchor3d) {
                // this.scene.add(view.overlayAnchor3d.mesh);
                this.anchors3d.push(view.overlayAnchor3d);
            }
            if (view.overlayAnchor && view.overlayAnchor.isVisible()) {
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
            if ( view.overlayAnchor && view.overlayAnchor.isVisible()) {
                this.scene.remove(view.overlayAnchor.getSprite());
            }
        }
        this.views.delete(element.id);
    }

    private createNodeView(node: Node): DiagramElementView {
        const templateProvider =  this.props.nodeTemplateProvider || DEFAULT_NODE_TEMPLATE_PROVIDER;
        const nodeTemplate = {
            ...DEFAULT_NODE_TEMPLATE,
            ...templateProvider(node.data),
        };
        return new NodeView(node, nodeTemplate);
    }

    private createLinkView(link: Link): DiagramElementView | undefined {
        const templateProvider = this.props.linkTemplateProvider || DEFAULT_LINK_TEMPLATE_PROVIDER;
        const linkTemplate = {
            ...DEFAULT_LINK_TEMPLATE,
            ...templateProvider(link.model),
        };
        return new LinkView(link, this.linkRouter, linkTemplate);
    }

    update(specificIds: string[]) {
        const updateView = (elementId: string) => {
            const element = this.graphModel.getNodeById(elementId) || this.graphModel.getLinkById(elementId);
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
