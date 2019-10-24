import * as React from 'react';
import { ViewController, ViewControllersSet } from './controllers/viewController';
import { DEFAULT_VIEW_CONTROLLERS_SET } from './controllers/defaultViewControllers';
import { KeyHandler } from './utils/keyHandler';
import { DefaultEditor } from './editors/defaultEditor';
import { DiagramModel } from './models/diagramModel';
import { DiagramView, ViewOptions } from './views/diagramView';
import { Vector2d, Vector3d } from './models/structures';
import { applyForceLayout3d, applyRandomLayout } from './layout/layouts';
import { MouseHandler } from './utils/mouseHandler';
import { DEFAULT_MESH_WIDGET_SET } from './defaultWidgetsSet';
import { WidgetFactory } from './models/widgets/widget';
import { Node } from './models/graph/node';
import { OverlayPosition } from './views/graph/overlayAnchor';
import { ReactOverlay } from './customisation';
import { GamepadHandler } from './vrUtils/gamepadHandler';

export interface L3GraphProps {
    viewOptions?: ViewOptions;
    viewControllers?: ViewControllersSet;
    onComponentMount?: (graph: L3Graph) => void;
    onComponentUnmount?: (graph: L3Graph) => void;
}

export class L3Graph extends React.Component<L3GraphProps> {
    private diagramModel: DiagramModel;
    private view: DiagramView;
    private keyHandler: KeyHandler;
    private gamepadHandler: GamepadHandler;
    private mouseHandler: MouseHandler;
    private viewControllers: ViewController[] = [];
    private viewController: ViewController;
    private defaultEditor: DefaultEditor;

    constructor(props: L3GraphProps) {
        super(props);
        this.diagramModel = new DiagramModel();
        this.state = {};
    }

    get model() {
        return this.diagramModel;
    }

    setViewController(viewController: ViewController) {
        const oldViewController = this.viewController;
        this.viewController = viewController;
        if (oldViewController) {
            oldViewController.switchOff();
        }
        this.viewController.switchOn();
        this.forceUpdate();
    }

    attachOverlayToNode(node: Node, overlay: ReactOverlay, position: OverlayPosition) {
        const nodeView = this.view.graphView.views.get(node.id);
        if (nodeView) {
            nodeView.overlayAnchor.setOverlay(overlay, position);
        }
    }

    removeOverlayFromNode(node: Node, overlayId: string) {
        const nodeView = this.view.graphView.views.get(node.id);
        if (nodeView) {
            nodeView.overlayAnchor.removeOverlay(overlayId);
        }
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

    clientPosTo3dPos(position: Vector2d, distanceFromScreen: number = 600): Vector3d {
        return this.view.clientPosTo3dPos(position, distanceFromScreen);
    }

    pos3dToClientPos(position: Vector3d): Vector2d {
        return this.view.pos3dToClientPos(position);
    }

    private onViewMount = (view: DiagramView) => {
        this.view = view;
        this.view.graphView.on('overlay:down',
            ({data: {event, target}}) => this.mouseHandler.onMouseDown(event, target));
        this.mouseHandler = new MouseHandler(this.diagramModel, this.view);
        this.keyHandler = new KeyHandler();
        this.keyHandler.switchOn();
        this.gamepadHandler = new GamepadHandler(this.diagramModel, this.view);
        this.configureViewControllers();
        this.defaultEditor = new DefaultEditor(
            this.diagramModel,
            this.view,
            this.mouseHandler,
            this.keyHandler,
            this.gamepadHandler,
        );
        for (const widgetFactory of DEFAULT_MESH_WIDGET_SET) {
            this.registerWidget(widgetFactory);
        }
        this.forceUpdate();
    }

    private configureViewControllers() {
        this.viewControllers =
        (this.props.viewControllers || DEFAULT_VIEW_CONTROLLERS_SET)
            .map(makeController => makeController(this.view, this.mouseHandler, this.keyHandler, this.gamepadHandler));
        this.setViewController(this.viewControllers[0]);
        for (const vc of this.viewControllers) {
            vc.on('switched:off', () => {
                const currentViewControllerWasSwitchedOff = this.viewController === vc;
                if (currentViewControllerWasSwitchedOff) {
                    this.setViewController(this.viewControllers[0]);
                }
            })
        }

    } 

    private onFocus = () => {
        this.keyHandler.switchOn();
    }

    private onBlur = () => {
        this.keyHandler.switchOff();
    }

    public registerWidget(widgetResolver: WidgetFactory) {
        const widgetModel = widgetResolver.getModel({
            diagramModel: this.diagramModel,
            keyHandler: this.keyHandler,
            mouseHandler: this.mouseHandler,
            gamepadHandler: this.gamepadHandler,
        });
        this.view.widgetsView.registerViewResolver(widgetModel.widgetId, widgetResolver.getView);
        this.diagramModel.widgetRegistry.registerWidget(widgetModel);
    }

    public removeWidget(widgetId: string) {
        const widget = this.model.widgetRegistry.widgets.get(widgetId);
        if (widget) {
            this.model.widgetRegistry.removeWidget(widget);
        }
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
                onMouseDown={event => {
                    event.nativeEvent.preventDefault();
                    this.mouseHandler.onMouseDown(event.nativeEvent);
                }}
                onTouchStart={event => {
                    // event.nativeEvent.preventDefault();
                    this.mouseHandler.onMouseDown(event.nativeEvent);
                }}
                onWheel={event => this.mouseHandler.onScroll(event.nativeEvent)}>
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
                        onClick={() => { this.setViewController(viewController); }}>
                        {viewController.label[0]}
                    </button>;
                })}
                <button
                    id='l3graph-force-layout-button'
                    title='Force layaout'
                    onClick={() => { applyForceLayout3d(this.diagramModel.graph, 30, 200); }}>
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
