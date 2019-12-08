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
    onAdd3dObject: (object: THREE.Object3D) => void;
    onRemove3dObject: (object: THREE.Object3D) => void;
    nodeTemplateProvider?: NodeTemplateProvider;
    linkTemplateProvider?: LinkTemplateProvider;
    simpleLinks?: boolean;
}

export interface GraphViewEvents {
    'overlay:down': {event: MouseEvent | TouchEvent; target: Element};
}

export class GraphView extends Subscribable<GraphViewEvents> {
    views: Map<string, DiagramElementView>;
    anchors3d: Set<AbstracrOverlayAnchor3d<any, any>>;

    graphModel: GraphModel;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;
    linkRouter: LinkRouter;

    private vrManager: VrManager;

    constructor(private props: GraphViewProps) {
        super();
        this.views = new Map();
        this.graphModel = props.graphModel;
        this.linkRouter = new DefaultLinkRouter();
        this.graphModel.nodes.forEach(node => this.registerElement(node));
        this.graphModel.links.forEach(link => this.registerElement(link));
        this.anchors3d = new Set();
        this.vrManager = props.vrManager;
        this.vrManager.on('presenting:state:changed', () => {
            if (this.vrManager.isStarted) {
                this.anchors3d.forEach((sprite) => this.onAdd3dObject(sprite.mesh));
            } else {
                this.anchors3d.forEach((sprite) => this.onRemove3dObject(sprite.mesh));
            }
        })
    }

    public registerElement(element: Element): DiagramElementView {
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
                this.onAdd3dObject(view.mesh);
            }
            if (view.overlayAnchor) {
                view.overlayAnchor.html.addEventListener('mousedown', e => {
                    this.trigger('overlay:down', {event: e, target: element});
                }, false);
                view.overlayAnchor.html.addEventListener('touchstart', e => {
                    this.trigger('overlay:down', {event: e, target: element});
                }, false);
                this.onAdd3dObject(view.overlayAnchor.sprite);
            }
            if (view.overlayAnchor3d) {
                this.anchors3d.add(view.overlayAnchor3d);
                if (this.vrManager.isStarted) {
                    this.onAdd3dObject(view.overlayAnchor3d.mesh);
                }
            }
            this.views.set(element.id, view);
        }

        return view;
    }

    public removeElementView(element: Element) {
        const view = this.views.get(element.id);
        if (view) {
            if (view.mesh) {
                this.onRemove3dObject(view.mesh);
            }
            if (view.overlayAnchor) {
                this.onRemove3dObject(view.overlayAnchor.sprite);
            }
            if (view.overlayAnchor3d) {
                this.onRemove3dObject(view.overlayAnchor3d.mesh);
                this.anchors3d.delete(view.overlayAnchor3d);
            }
        }
        this.views.delete(element.id);
    }

    private onAdd3dObject(object: THREE.Object3D) {
        this.props.onAdd3dObject(object)
    }

    private onRemove3dObject(object: THREE.Object3D) {
        this.props.onRemove3dObject(object)
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
                const oldView = this.views.get(element.id);
                this.removeElementView(element);
                const newView = this.registerElement(element);

                // Restore overlays
                oldView.overlayAnchor.overlays.forEach((overlaysById, position) => {
                    overlaysById.forEach(overlay =>{
                        newView.overlayAnchor.setOverlay(overlay, position);
                    });
                })

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
