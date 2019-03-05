import * as React from 'react';
import { ViewController, ViewControllersSet } from './controllers/viewController';
import { DEFAULT_VIEW_CONTROLLERS_SET } from './controllers/defaultViewControllers';
import { KeyHandler } from './utils/keyHandler';
import { NodeTemplateProvider, LinkTemplateProvider } from './templates';
import { MouseEditor } from './editors/mouseEditor';
import { DiagramModel } from './models/diagramModel';
import { DiagramView } from './views/diagramView';
import { Link } from './models/link';
import { Node } from './models/node';
import { isTypesEqual } from './utils';
import { Vector2D, Vector3D } from './models/primitives';

export interface GraphElements {
    nodes: Node[];
    links: Link[];
}

interface GraphUpdate {
    newNodes?: Node[];
    newLinks?: Link[];
    nodesToRemove?: Node[];
    linksToRemove?: Link[];
    nodesToUpdate?: Node[];
    linksToUpdate?: Link[];
}

export interface L3GraphProps {
    graph: GraphElements;
    viewOptions?: ViewOptions;
    viewControllers?: ViewControllersSet;
    onComponentMount?: (graph: L3Graph) => void;
    onComponentUnmount?: (graph: L3Graph) => void;
}

export interface ViewOptions {
    nodeTemplateProvider?: NodeTemplateProvider;
    linkTemplateProvider?: LinkTemplateProvider;
}

export interface State {
    viewController?: ViewController;
}

export class L3Graph extends React.Component<L3GraphProps, State> {
    public model: DiagramModel;
    private view: DiagramView;
    private keyHandler: KeyHandler;
    private viewControllers: ViewController[] = [];
    private mouseEditor: MouseEditor;

    constructor(props: L3GraphProps) {
        super(props);
        this.model = new DiagramModel();
        this.state = {};
        this.keyHandler = new KeyHandler();
        this.updateGraph({
            newNodes: props.graph.nodes,
            newLinks: props.graph.links,
        });
    }

    componentWillUpdate(props: L3GraphProps) {
        const {graph} = props;
        this.updateGraph(
            this.merge(graph),
        );
    }

    get viewController() {
        return this.state.viewController;
    }

    set viewController(viewController: ViewController) {
        viewController.refreshCamera();
        this.setState({viewController});
    }

    componentDidMount() {
        if (this.props.onComponentMount) {
            this.props.onComponentMount(this);
        }
        this.keyHandler.on('keyPressed', (event) => this.onKeyPressed(event.data));
    }

    componentWillUnmount() {
        if (this.props.onComponentUnmount) {
            this.props.onComponentUnmount(this);
        }
        this.onBlur();
    }

    clientPosTo3dPos(position: Vector2D, distanceFromScreen: number = 600): Vector3D {
        return this.view.clientPosTo3dPos(position, distanceFromScreen);
    }

    private updateGraph(update: GraphUpdate) {
        const {newNodes, newLinks, nodesToRemove, linksToRemove, linksToUpdate, nodesToUpdate} = update;
        if (newNodes) { this.model.addElements(newNodes); }
        if (newLinks) { this.model.addElements(newLinks); }
        if (linksToRemove && linksToRemove.length > 0) { this.model.removeLinksByIds(linksToRemove.map(l => l.id)); }
        if (nodesToRemove && nodesToRemove.length > 0) { this.model.removeNodesByIds(nodesToRemove.map(n => n.id)); }
        if (nodesToUpdate && nodesToUpdate.length > 0) { this.model.updateElements(nodesToUpdate); }
        if (linksToUpdate && linksToUpdate.length > 0) { this.model.updateElements(linksToUpdate); }
    }

    private merge(newGraphModel: GraphElements): GraphUpdate {
        const graph = this.model.graph;
        const {nodes, links} = newGraphModel;

        const newNodes: Node[] = [];
        const newLinks: Link[] = [];
        const nodesToRemove: Node[] = [];
        const linksToRemove: Link[] = [];
        const nodesToUpdate: Node[] = [];
        const linksToUpdate: Link[] = [];

        const nodeMap = new Map<string, Node>();
        for (const node of nodes) {
            const id = node.id;
            if (!graph.nodes.has(id)) {
                newNodes.push(node);
            } else {
                const curNode = graph.nodes.get(id);
                const needUpdateView =
                    curNode.data !== node.data ||
                    !isTypesEqual(curNode.types, node.types);

                if (needUpdateView) {
                    nodesToUpdate.push(node);
                }
            }
            nodeMap.set(id, node);
        }
        if (graph.nodes) {
            graph.nodes.forEach(node => {
                if (!nodeMap.has(node.id)) {
                    nodesToRemove.push(node);
                }
            });
        }

        const linksMap = new Map<string, Link>();
        for (const link of links) {
            const id = link.id;
            if (!graph.links.has(id)) {
                newLinks.push(link);
            } else {
                const curLink = graph.links.get(id);
                const needUpdateView =
                    curLink.label !== link.label ||
                    curLink.types.sort().join('') !== link.types.sort().join('');

                if (needUpdateView) {
                    linksToUpdate.push(link);
                }
            }
            linksMap.set(id, link);
        }
        if (graph.links) {
            graph.links.forEach(link => {
                if (!linksMap.has(link.id)) {
                    linksToRemove.push(link);
                }
            });
        }

        return {newNodes, newLinks, nodesToRemove, linksToRemove, nodesToUpdate, linksToUpdate};
    }

    private onWheel(e: React.WheelEvent<HTMLDivElement>) {
        this.viewController.onMouseWheel(e.nativeEvent);
    }

    private onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
        if (this.mouseEditor.onMouseDown(event.nativeEvent)) {
            this.viewController.onMouseDown(event.nativeEvent);
        }
    }

    private onViewMount = (view: DiagramView) => {
        this.view = view;
        const controllersSet = this.props.viewControllers || DEFAULT_VIEW_CONTROLLERS_SET;
        this.viewControllers = controllersSet.map(controller => controller(view));
        this.viewController = this.viewControllers[0];
        this.mouseEditor = new MouseEditor(this.model, view);
        this.forceUpdate();
    }

    private onFocus = () => {
        this.keyHandler.switchOn();
    }

    private onBlur = () => {
        this.keyHandler.switchOff();
    }

    private onKeyPressed = (keyMap: Set<number>) => {
        if (this.viewController) {
            this.viewController.onKeyPressed(keyMap);
        }
    }

    render() {
        const viewOptions: ViewOptions = this.props.viewOptions || {};
        return <div
            tabIndex={0}
            className='o3d-main'
            onFocus={this.onFocus}
            onBlur={this.onBlur}>
            <div
                className='o3d-main__touch-panel'
                onMouseDown={event => this.onMouseDown(event)}
                onWheel={event => this.onWheel(event)}>
                <DiagramView
                    model={this.model}
                    onViewMount={this.onViewMount}
                    nodeTemplateProvider={viewOptions.nodeTemplateProvider}
                    linkTemplateProvider={viewOptions.linkTemplateProvider}>
                </DiagramView>
            </div>
            <div className='o3d-toolbar'>
                {this.viewControllers.map((viewController, index) => {
                    return <button
                        key={`controller-button-${index}`}
                        className={this.viewController === viewController ? 'o3d-selected' : ''}
                        onClick={() => { this.viewController = viewController; }}>
                        {viewController.label[0]}
                    </button>;
                })}
            </div>
        </div>;
    }
}
