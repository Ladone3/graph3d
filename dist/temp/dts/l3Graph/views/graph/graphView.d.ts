import * as THREE from 'three';
import { GraphModel, Element } from '../../models/graph/graphModel';
import { NodeView } from './nodeView';
import { LinkView } from './linkView';
import { TemplateProvider } from '../../customization';
import { Subscribable } from '../../utils';
import { Link, LinkId } from '../../models/graph/link';
import { Node, NodeId } from '../../models/graph/node';
import { LinkRouter } from '../../utils/linkRouter';
import { VrManager } from '../../vrUtils/vrManager';
import { AbstractOverlayAnchor3d } from './overlay3DAnchor';
import { GraphDescriptor } from '../../models/graph/graphDescriptor';
export interface GraphViewProps<Descriptor extends GraphDescriptor> {
    graphModel: GraphModel<Descriptor>;
    vrManager: VrManager<Descriptor>;
    onAdd3dObject: (object: THREE.Object3D) => void;
    onRemove3dObject: (object: THREE.Object3D) => void;
    nodeTemplateProvider?: TemplateProvider<Node<Descriptor>>;
    linkTemplateProvider?: TemplateProvider<Link<Descriptor>, Descriptor>;
    simpleLinks?: boolean;
}
export interface GraphViewEvents<Descriptor extends GraphDescriptor> {
    'overlay:down': {
        event: MouseEvent | TouchEvent;
        target: Element<Descriptor>;
    };
}
export declare class GraphView<Descriptor extends GraphDescriptor> extends Subscribable<GraphViewEvents<Descriptor>> {
    private props;
    nodeViews: Map<NodeId, NodeView<Descriptor>>;
    linkViews: Map<LinkId, LinkView<Descriptor>>;
    anchors3d: Set<AbstractOverlayAnchor3d<any, any>>;
    graphModel: GraphModel<Descriptor>;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;
    linkRouter: LinkRouter<Descriptor>;
    private vrManager;
    constructor(props: GraphViewProps<Descriptor>);
    registerNode(node: Node<Descriptor>): NodeView<Descriptor>;
    registerLink(link: Link<Descriptor>): LinkView<Descriptor>;
    removeNodeView(node: Node<Descriptor>): void;
    removeLinkView(link: Link<Descriptor>): void;
    private registerView;
    private unsubscribeFromView;
    private onAdd3dObject;
    private onRemove3dObject;
    update({ updatedNodeIds, updatedLinkIds }: {
        updatedNodeIds: NodeId[];
        updatedLinkIds: LinkId[];
    }): void;
    private updateLinkView;
    private updateNodeView;
}
