import * as React from 'react';
import { ViewController, ViewControllersSet, MIN_DRAG_OFFSET } from './controllers/viewController';
import { DEFAULT_VIEW_CONTROLLERS_SET } from './controllers/defaultViewControllers';
import { KeyHandler } from './utils/keyHandler';
import { MouseEditor } from './editors/mouseEditor';
import { DiagramModel } from './models/diagramModel';
import { DiagramView, ViewOptions } from './views/diagramView';
import { Link } from './models/link';
import { Node } from './models/node';
import { isTypesEqual, handleDragging, EventObject } from './utils';
import { Vector2D, Vector3D } from './models/primitives';
import { applyForceLayout3d, applyRandomLayout } from './layout/layouts';
import { Element } from './models/graphModel';

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
    elements: GraphElements;
    viewOptions?: ViewOptions;
    viewControllers?: ViewControllersSet;
    onComponentMount?: (graph: L3Graph) => void;
    onComponentUnmount?: (graph: L3Graph) => void;
}

export interface State {
    viewController?: ViewController;
    vrMode?: boolean;
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
            newNodes: this.props.elements.nodes,
            newLinks: this.props.elements.links,
        });
    }

    componentWillUpdate(props: L3GraphProps) {
        const {elements} = props;
        this.updateGraph(
            this.merge(elements),
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

    pos3dToClientPos(position: Vector3D): Vector2D {
        return this.view.pos3dToClientPos(position);
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
        e.preventDefault();
    }

    // todo: improve mouse proccessing pipline
    private onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
        const elementNotCaptured = this.mouseEditor.onMouseDown(event.nativeEvent);
        if (elementNotCaptured) {
            this.viewController.onMouseDown(event.nativeEvent);
            handleDragging(event.nativeEvent, () => {
                // do nothing
            }, (dragEvent, offset) => {
                const dist = Math.sqrt(offset.x * offset.x + offset.y * offset.y);
                if (dist < MIN_DRAG_OFFSET) {
                    this.model.selection = new Set();
                }
            });
        }
    }

    // todo: improve mouse proccessing pipline
    private onOverlayDown(event: EventObject<'click:overlay', {event: MouseEvent; target: Element}>) {
        event.data.event.stopPropagation();
        event.data.event.preventDefault();
        this.mouseEditor.onOverlayDown(event.data.event, event.data.target);
    }

    private onViewMount = (view: DiagramView) => {
        this.view = view;
        const controllersSet = this.props.viewControllers || DEFAULT_VIEW_CONTROLLERS_SET;
        this.viewControllers = controllersSet.map(controller => controller(view));
        this.viewController = this.viewControllers[0];
        this.mouseEditor = new MouseEditor(this.model, view);
        this.view.graphView.on('click:overlay', (event) => this.onOverlayDown(event));
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
                    viewOptions={viewOptions}>
                </DiagramView>
            </div>
            <div className='o3d-toolbar'>
                <button
                    title='Help'
                    onClick={() => { alert(`
Next three buttons provide three ways of navigation in 3D space!
Hold mouse over the button to see full name of view controller. Use mouse and keyboard arrows for navigation
S (Spherical view controller) - Camera is moving around the center of the diagram.
C (Cylindrical view controller) - Camera is moving around the pivot which is placed in the center of the diagram.
O (Open space view controller) - You can move in any direction. Change the view direction my mouse dragging,
and change the position by using keyboard arrows.
                    `); }}>
                    <h2 style={{margin: 0}}>?</h2>
                </button>
                {this.viewControllers.map((viewController, index) => {
                    return <button
                        title={viewController.label}
                        key={`controller-button-${index}`}
                        className={this.viewController === viewController ? 'o3d-selected' : ''}
                        onClick={() => { this.viewController = viewController; }}>
                        {viewController.label[0]}
                    </button>;
                })}
                <button
                    id='o3d-force-layout-button'
                    title='Force layaout'
                    onClick={() => { applyForceLayout3d(this.model.graph, 30, 150); }}>
                    FL
                </button>
                <button
                    id='o3d-random-layout-button'
                    title='Random layaout'
                    onClick={() => { applyRandomLayout(this.model.graph); }}>
                    RL
                </button>
                <button
                    id='o3d-vr-button'
                    title={`${this.state.vrMode ? 'Switch off VR mode' : 'Switch on VR mode'}`}
                    onClick={() => {
                        if (this.state.vrMode) {
                            this.view.switchOffVr();
                            this.setState({vrMode: false});
                        } else {
                            this.view.switchOnVr();
                            this.setState({vrMode: true});
                        }
                        this.view.renderGraph();
                    }}>
                    VR {`${this.state.vrMode ? '-' : '+'}`}
                </button>
            </div>
        </div>;
    }
}
