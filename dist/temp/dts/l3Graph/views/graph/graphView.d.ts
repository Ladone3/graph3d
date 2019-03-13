import * as THREE from 'three';
import { GraphModel, Element } from '../../models/graph/graphModel';
import { NodeView } from './nodeView';
import { LinkView } from './linkView';
import { NodeTemplateProvider, LinkTemplateProvider } from '../../customization';
import { Subscribable } from '../../utils';
import { Link, LinkId } from '../../models/graph/link';
import { Node, NodeId } from '../../models/graph/node';
import { LinkRouter } from '../../utils/linkRouter';
import { DiagramElementView } from '../viewInterface';
import { VrManager } from '../../vrUtils/vrManager';
import { AbstractOverlayAnchor3d } from './overlay3DAnchor';
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
    'overlay:down': {
        event: MouseEvent | TouchEvent;
        target: Element;
    };
}
export declare class GraphView extends Subscribable<GraphViewEvents> {
    private props;
    nodeViews: Map<NodeId, NodeView>;
    linkViews: Map<LinkId, LinkView>;
    anchors3d: Set<AbstractOverlayAnchor3d<any, any>>;
    graphModel: GraphModel;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;
    linkRouter: LinkRouter;
    private vrManager;
    constructor(props: GraphViewProps);
    registerNode(node: Node): DiagramElementView;
    registerLink(link: Link): DiagramElementView;
    removeNodeView(node: Node): void;
    removeLinkView(link: Link): void;
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
