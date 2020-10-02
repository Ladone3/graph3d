import * as THREE from 'three';
import { GraphModel, Element } from '../../models/graph/graphModel';
import { NodeView } from './nodeView';
import { LinkView } from './linkView';
import {
    TemplateProvider,
    DEFAULT_LINK_TEMPLATE_PROVIDER,
    DEFAULT_NODE_TEMPLATE_PROVIDER,
} from '../../customization';
import { Subscribable } from '../../utils';
import { Link, LinkId } from '../../models/graph/link';
import { Node, NodeId } from '../../models/graph/node';
import { LinkRouter, DefaultLinkRouter } from '../../utils/linkRouter';
import { DiagramElementView } from '../viewInterface';
import { VrManager } from '../../vrUtils/vrManager';
import { AbstractOverlayAnchor3d } from './overlay3DAnchor';

export interface GraphViewProps {
    graphModel: GraphModel;
    vrManager: VrManager;
    onAdd3dObject: (object: THREE.Object3D) => void;
    onRemove3dObject: (object: THREE.Object3D) => void;
    nodeTemplateProvider?: TemplateProvider<Node>;
    linkTemplateProvider?: TemplateProvider<Link>;
    simpleLinks?: boolean;
}

export interface GraphViewEvents {
    'overlay:down': {
        event: MouseEvent | TouchEvent;
        target: Element;
    };
}

export class GraphView extends Subscribable<GraphViewEvents> {
    nodeViews = new Map<Node, NodeView>();
    linkViews = new Map<Link, LinkView>();
    anchors3d: Set<AbstractOverlayAnchor3d<any, any>>;

    graphModel: GraphModel;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;
    linkRouter: LinkRouter;

    private vrManager: VrManager;

    constructor(private props: GraphViewProps) {
        super();
        this.graphModel = props.graphModel;
        this.linkRouter = new DefaultLinkRouter();
        this.graphModel.nodes.forEach(node => this.registerNode(node));
        this.graphModel.links.forEach(link => this.registerLink(link));
        this.anchors3d = new Set();
        this.vrManager = props.vrManager;
        this.vrManager.on('connection:state:changed', () => {
            if (this.vrManager.isConnected) {
                this.anchors3d.forEach((sprite) => this.onAdd3dObject(sprite.mesh));
            } else {
                this.anchors3d.forEach((sprite) => this.onRemove3dObject(sprite.mesh));
            }
        });
    }

    public registerNode(node: Node) {
        const isNodeViewExists = this.nodeViews.get(node);
        if (isNodeViewExists) {
            return; // We've already registered the view for this element
        }
        const templateProvider =  this.props.nodeTemplateProvider || DEFAULT_NODE_TEMPLATE_PROVIDER as any;
        const nodeTemplate = templateProvider(node);

        const view = new NodeView(node, nodeTemplate);
        this.registerView(view);
        this.nodeViews.set(node, view);

        return view;
    }

    public registerLink(link: Link) {
        const elementViewExists = this.linkViews.get(link);
        if (elementViewExists) {
            return; // We've registered the view for this element
        }
        const templateProvider = this.props.linkTemplateProvider || DEFAULT_LINK_TEMPLATE_PROVIDER as any;
        const linkTemplate = templateProvider(link);
        const view = new LinkView(link, this.linkRouter, linkTemplate);
        this.registerView(view);
        this.linkViews.set(link, view);

        return view;
    }

    public removeNodeView(node: Node) {
        const view = this.nodeViews.get(node);
        if (view) {
            this.unsubscribeFromView(view);
            this.nodeViews.delete(node);
        }
    }

    public removeLinkView(link: Link) {
        const view = this.linkViews.get(link);
        if (view) {
            this.unsubscribeFromView(view);
            this.linkViews.delete(link);
        }
    }

    private registerView(view: DiagramElementView) {
        if (view.mesh) {
            this.onAdd3dObject(view.mesh);
        }
        if (view.overlayAnchor) {
            view.overlayAnchor.html.addEventListener('mousedown', e => {
                this.trigger('overlay:down', {event: e, target: view.model});
            }, false);
            view.overlayAnchor.html.addEventListener('touchstart', e => {
                this.trigger('overlay:down', {event: e, target: view.model});
            }, false);
            this.onAdd3dObject(view.overlayAnchor.sprite);
        }
        if (view.overlayAnchor3d) {
            this.anchors3d.add(view.overlayAnchor3d);
            if (this.vrManager.isConnected) {
                this.onAdd3dObject(view.overlayAnchor3d.mesh);
            }
        }

        return view;
    }

    private unsubscribeFromView(view: DiagramElementView) {
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

    private onAdd3dObject(object: THREE.Object3D) {
        this.props.onAdd3dObject(object);
    }

    private onRemove3dObject(object: THREE.Object3D) {
        this.props.onRemove3dObject(object);
    }

    update({
        updatedNodeIds,
        updatedLinkIds,
    }: {
        updatedNodeIds: NodeId[];
        updatedLinkIds: LinkId[];
    }) {
        if (updatedNodeIds) {
            for (const id of updatedNodeIds) {
                const node = this.graphModel.getNodeById(id);
                if (node) {
                    this.updateNodeView(node);
                }
            }
        } else {
            this.nodeViews.forEach(view => {
                this.updateNodeView(view.model);
            });
        }
        if (updatedLinkIds) {
            for (const id of updatedLinkIds) {
                const link = this.graphModel.getLinkById(id);
                if (link) {
                    this.updateLinkView(link);
                }
            }
        } else {
            this.linkViews.forEach(view => {
                this.updateLinkView(view.model);
            });
        }
    }

    private updateLinkView(link: Link) {
        if (link.modelIsChanged) {
            const oldView = this.linkViews.get(link);
            this.removeLinkView(link);
            const newView = this.registerLink(link);

            // Restore overlays
            oldView.overlayAnchor.overlays.forEach((overlaysById, position) => {
                overlaysById.forEach(overlay => {
                    newView.overlayAnchor.setOverlay(overlay, position);
                });
            });

            link.modelIsChanged = false;
        }
        const view = this.linkViews.get(link);
        if (view) { // Can be case when model is not changed but also is not loaded
            view.update();
        }
    }

    private updateNodeView(node: Node) {
        if (node.modelIsChanged) {
            const oldView = this.nodeViews.get(node);
            this.removeNodeView(node);
            const newView = this.registerNode(node);

            // Restore overlays
            oldView.overlayAnchor.overlays.forEach((overlaysById, position) => {
                overlaysById.forEach(overlay => {
                    newView.overlayAnchor.setOverlay(overlay, position);
                });
            });

            node.modelIsChanged = false;
        }
        const view = this.nodeViews.get(node);
        if (view) { // Can be case when model is not changed but also is not loaded
            view.update();
        }
    }
}
