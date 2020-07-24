import * as React from 'react';
import { ViewController, ViewControllersSet } from './controllers/viewController';
import { KeyHandler } from './utils/keyHandler';
import { DefaultEditor } from './editors/defaultEditor';
import { DiagramModel } from './models/diagramModel';
import { DiagramView, ViewOptions } from './views/diagramView';
import { Vector2d, Vector3d } from './models/structures';
import { MouseHandler } from './utils/mouseHandler';
import { WidgetFactory, Widget } from './models/widgets/widget';
import { Node } from './models/graph/node';
import { OverlayPosition } from './views/graph/overlayAnchor';
import { ReactOverlay } from './customization';
import { GamepadHandler } from './vrUtils/gamepadHandler';
import { GamepadEditor } from './editors/gamepadEditor';
import { DEFAULT_VIEW_CONTROLLERS_SET } from './controllers/defaultViewControllers';
import { DEFAULT_MESH_WIDGET_SET } from './defaultWidgetsSet';
import { GraphDescriptor } from './models/graph/graphDescriptor';

export interface L3GraphProps<Descriptor extends GraphDescriptor> {
    viewOptions?: ViewOptions<Descriptor>;
    viewControllers?: ViewControllersSet<Descriptor>;
    onComponentMount?: (graph: L3Graph<Descriptor>) => void;
    onComponentUnmount?: (graph: L3Graph<Descriptor>) => void;
}

export class L3Graph<Descriptor extends GraphDescriptor> extends React.Component<L3GraphProps<Descriptor>> {
    private diagramModel: DiagramModel<Descriptor>;
    private view: DiagramView<Descriptor>;
    private keyHandler: KeyHandler;
    private gamepadHandler: GamepadHandler<Descriptor>;
    private mouseHandler: MouseHandler<Descriptor>;
    private viewControllers: ViewController[] = [];
    private viewController: ViewController;
    // todo: handle duplication - the one should substitute another depending on the events
    private defaultEditor: DefaultEditor<Descriptor>;
    private gamepadEditor: GamepadEditor<Descriptor>;

    constructor(props: L3GraphProps<Descriptor>) {
        super(props);
        this.diagramModel = new DiagramModel();
        this.state = {};
    }

    get model() {
        return this.diagramModel;
    }

    resize() {
        if (this.view) { this.view.resize(); }
    }

    getViewControllers(): ReadonlyArray<ViewController> {
        return this.viewControllers;
    }

    getViewController(): ViewController {
        return this.viewController;
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

    attachOverlayToNode(
        node: Node<Descriptor>,
        overlay: ReactOverlay<Node<Descriptor>>,
        position: OverlayPosition
    ) {
        const nodeView = this.view.graphView.nodeViews.get(node.id);
        if (nodeView) {
            nodeView.overlayAnchor.setOverlay(overlay, position);
        }
    }

    removeOverlayFromNode(node: Node<Descriptor>, overlayId: string) {
        const nodeView = this.view.graphView.nodeViews.get(node.id);
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

    private onViewMount = (view: DiagramView<Descriptor>) => {
        this.view = view;
        this.view.graphView.on('overlay:down',
            ({data: {event, target}}) => this.mouseHandler.fireMouseDownEvent(event, target));
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
        );
        this.gamepadEditor = new GamepadEditor(this.gamepadHandler);
        for (const widgetFactory of DEFAULT_MESH_WIDGET_SET()) {
            this.registerWidget(widgetFactory as any);
        }
        this.forceUpdate();
    }

    private configureViewControllers() {
        this.viewControllers =
        (this.props.viewControllers || DEFAULT_VIEW_CONTROLLERS_SET())
            .map(makeController => makeController(this.view, this.mouseHandler, this.keyHandler, this.gamepadHandler));
        this.setViewController(this.viewControllers[0]);
        for (const vc of this.viewControllers) {
            vc.on('switched:off', () => {
                const currentViewControllerWasSwitchedOff = this.viewController === vc;
                if (currentViewControllerWasSwitchedOff && this.viewControllers[0] !== vc) {
                    this.setViewController(this.viewControllers[0]);
                }
            });
        }
    }

    private onFocus = () => {
        this.keyHandler.switchOn();
    }

    private onBlur = () => {
        this.keyHandler.switchOff();
    }

    public registerWidget<CustomWidget extends Widget>(widgetResolver: WidgetFactory<CustomWidget, Descriptor>) {
        const widgetModel = widgetResolver.getModel({
            vrManager: this.view.vrManager,
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
        const viewOptions: ViewOptions<Descriptor> = this.props.viewOptions || {};
        return <div
            tabIndex={0}
            className='l3graph-main'
            onFocus={this.onFocus}
            onBlur={this.onBlur}>
            <div
                className='l3graph-main__touch-panel'
                onMouseDown={event => {
                    if (event.currentTarget !== event.target) { return; }
                    this.mouseHandler.fireMouseDownEvent(event.nativeEvent);
                }}
                onTouchStart={event => {
                    if (event.currentTarget !== event.target) { return; }
                    this.mouseHandler.fireMouseDownEvent(event.nativeEvent);
                }}
                onWheel={event => this.mouseHandler.fireScrollEvent(event.nativeEvent)}>
                <DiagramView
                    model={this.diagramModel}
                    onViewMount={this.onViewMount}
                    viewOptions={viewOptions}>
                </DiagramView>
            </div>
            {this.props.children}
        </div>;
    }
}

const HELP_TEXT = `Next three buttons provide three ways of navigation in 3D space!
Hold mouse over the button to see full name of view controller. Use mouse and keyboard arrows for navigation
S (Spherical view controller) - Camera is moving around the center of the diagram.
C (Cylindrical view controller) - Camera is moving around the pivot which is placed in the center of the diagram.
O (Open space view controller) - You can move in any direction. Change the view direction my mouse dragging,
and change the position by using keyboard arrows.`;
