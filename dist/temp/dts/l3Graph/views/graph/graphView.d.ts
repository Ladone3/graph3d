import { GraphModel, Element } from '../../models/graph/graphModel';
import { GraphDescriptor } from '../../models/graph/graphDescriptor';
import { NodeView } from './nodeView';
import { LinkView } from './linkView';
import { TemplateProvider } from '../../customization';
import { Subscribable } from '../../utils';
import { Link, LinkId } from '../../models/graph/link';
import { Node, NodeId } from '../../models/graph/node';
import { LinkRouter } from '../../utils/linkRouter';
import { VrManager } from '../../vrUtils/vrManager';
import { Core } from '../../core';
import { AbstractOverlayAnchor, AbstractOverlayAnchor3d } from './overlayAnchor';
export interface GraphViewProps {
    core: Core;
    graphModel: GraphModel;
    vrManager: VrManager;
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
export declare class GraphView extends Subscribable<GraphViewEvents> {
    private props;
    nodeViews: Map<Node<GraphDescriptor<unknown, unknown>>, NodeView>;
    linkViews: Map<Link<GraphDescriptor<unknown, unknown>>, LinkView>;
    anchors3d: Map<AbstractOverlayAnchor<unknown, unknown>, AbstractOverlayAnchor3d<unknown, unknown>>;
    graphModel: GraphModel;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;
    linkRouter: LinkRouter;
    private vrManager;
    constructor(props: GraphViewProps);
    registerNode(node: Node): NodeView;
    registerLink(link: Link): LinkView;
    removeNodeView(node: Node): void;
    removeLinkView(link: Link): void;
    private registerView;
    private unsubscribeFromView;
    private add3dObject;
    private remove3dObject;
    update({ updatedNodeIds, updatedLinkIds, }: {
        updatedNodeIds: NodeId[];
        updatedLinkIds: LinkId[];
    }): void;
    private updateLinkView;
    private updateNodeView;
}
