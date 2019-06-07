import * as React from 'react';
import { ViewController, ViewControllersSet } from './controllers/viewController';
import { DEFAULT_VIEW_CONTROLLERS_SET } from './controllers/defaultViewControllers';
import { KeyHandler } from './utils/keyHandler';
import { DefaultEditor } from './editors/defaultEditor';
import { DiagramModel, Graph } from './models/diagramModel';
import { DiagramView, ViewOptions } from './views/diagramView';
import { Vector2D, Vector3D } from './models/primitives';
import { applyForceLayout3d, applyRandomLayout } from './layout/layouts';
import { MouseHandler } from './utils/mouseHandler';
import { EventObject } from './utils';
import { Element } from './models/graphModel';
import { Node } from './models/node';
import { DEFAULT_WIDGET_SET } from './defaultWidgetsSet';
import { WidgetResolver } from './models/widgets';

export interface L3GraphProps {
    graph: Graph;
    viewOptions?: ViewOptions;
    viewControllers?: ViewControllersSet;
    widgetResolvers?: WidgetResolver[];
    onComponentMount?: (graph: L3Graph) => void;
    onComponentUnmount?: (graph: L3Graph) => void;
}

export interface State {
    viewController?: ViewController;
}

export class L3Graph extends React.Component<L3GraphProps, State> {
    private diagramModel: DiagramModel;
    private view: DiagramView;
    private keyHandler: KeyHandler;
    private mouseHandler: MouseHandler;
    private viewControllers: ViewController[] = [];
    private defaultEditor: DefaultEditor;
    private widgetResolvers: WidgetResolver[];

    constructor(props: L3GraphProps) {
        super(props);
        this.diagramModel = new DiagramModel();
        this.state = {};
        this.diagramModel.updateGraph({
            nodes: this.props.graph.nodes,
            links: this.props.graph.links,
        });
        this.widgetResolvers = props.widgetResolvers || DEFAULT_WIDGET_SET;
    }

    componentDidUpdate(props: L3GraphProps) {
        const {graph} = props;
        this.diagramModel.updateGraph(graph);
    }

    get model() {
        return this.diagramModel;
    }

    get viewController() {
        return this.state.viewController;
    }

    set viewController(viewController: ViewController) {
        if (this.state.viewController) {
            this.state.viewController.switchOff();
        }
        viewController.switchOn();
        this.setState({viewController});
    }

    componentDidMount() {
        if (this.props.onComponentMount) {
            this.props.onComponentMount(this);
        }
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

    private onWheel(e: React.WheelEvent<HTMLDivElement>) {
        if (this.mouseHandler) {
            this.mouseHandler.onScroll(e.nativeEvent);
        }
    }

    private onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
        if (this.mouseHandler) {
            this.mouseHandler.onMouseDown(event.nativeEvent);
        }
    }

    private onOverlayDown(event: EventObject<'click:overlay', {event: MouseEvent; target: Element}>) {
        if (this.mouseHandler) {
            this.mouseHandler.onMouseDown(event.data.event, event.data.target);
            event.data.event.stopPropagation();
        }
    }

    private onViewMount = (view: DiagramView) => {
        this.view = view;
        this.view.graphView.on('click:overlay', (event) => this.onOverlayDown(event));
        this.mouseHandler = new MouseHandler(this.diagramModel, this.view);
        this.keyHandler = new KeyHandler();

        this.viewControllers =
            (this.props.viewControllers || DEFAULT_VIEW_CONTROLLERS_SET)
                .map(controller => controller(this.view, this.mouseHandler, this.keyHandler));
        this.viewController = this.viewControllers[0];
        this.defaultEditor = new DefaultEditor(
            this.diagramModel,
            this.view,
            this.mouseHandler,
            this.keyHandler,
        );
        for (const widgetResolver of this.widgetResolvers) {
            this.registerWidget(widgetResolver);
        }
        this.forceUpdate();
    }

    private onFocus = () => {
        this.keyHandler.switchOn();
    }

    private onBlur = () => {
        this.keyHandler.switchOff();
    }

    public registerWidget(widgetResolver: WidgetResolver) {
        const widgetModel = widgetResolver.model({
            diagramModel: this.diagramModel,
            keyHandler: this.keyHandler,
            mouseHandler: this.mouseHandler,
        });
        this.view.widgetsView.registerView(widgetModel.widgetId, widgetResolver.view);
        this.diagramModel.widgets.registerWidget(widgetModel);
    }

    render() {
        const viewOptions: ViewOptions = this.props.viewOptions || {};
        return <div
            tabIndex={0}
            className='l3graph-main'
            onFocus={this.onFocus}
            onBlur={this.onBlur}>
            <div
                className='l3graph-main__touch-panel'
                onMouseDown={event => this.onMouseDown(event)}
                onWheel={event => this.onWheel(event)}>
                <DiagramView
                    model={this.diagramModel}
                    onViewMount={this.onViewMount}
                    viewOptions={viewOptions}>
                </DiagramView>
            </div>
            <div className='l3graph-toolbar'>
                <button
                    title='Help'
                    onClick={() => { alert(HELP_TEXT); }}>
                    <h2 style={{margin: 0}}>?</h2>
                </button>
                {this.viewControllers.map((viewController, index) => {
                    return <button
                        title={viewController.label}
                        key={`controller-button-${index}`}
                        className={this.viewController === viewController ? 'l3graph-selected' : ''}
                        onClick={() => { this.viewController = viewController; }}>
                        {viewController.label[0]}
                    </button>;
                })}
                <button
                    id='l3graph-force-layout-button'
                    title='Force layaout'
                    onClick={() => { applyForceLayout3d(this.diagramModel.graph, 30, 150); }}>
                    FL
                </button>
                <button
                    id='l3graph-random-layout-button'
                    title='Random layaout'
                    onClick={() => { applyRandomLayout(this.diagramModel.graph); }}>
                    RL
                </button>
            </div>
        </div>;
    }
}

const HELP_TEXT = `Next three buttons provide three ways of navigation in 3D space!
Hold mouse over the button to see full name of view controller. Use mouse and keyboard arrows for navigation
S (Spherical view controller) - Camera is moving around the center of the diagram.
C (Cylindrical view controller) - Camera is moving around the pivot which is placed in the center of the diagram.
O (Open space view controller) - You can move in any direction. Change the view direction my mouse dragging,
and change the position by using keyboard arrows.`;
