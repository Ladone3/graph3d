import * as React from 'react';
import * as THREE from 'three';
import { Vector3d, Vector2d } from '../models/structures';
import { TemplateProvider } from '../customization';
import { GraphView } from './graph/graphView';
import { DiagramModel } from '../models/diagramModel';
import { WidgetsView } from './widgets/widgetsView';
import { Widget } from '../models/widgets/widget';
import { vector3dToTreeVector3, eventToPosition, Subscribable } from '../utils';
import { NodeId, Node } from '../models/graph/node';
import { LinkId, Link } from '../models/graph/link';
import { ElementHighlighter } from '../utils/highlighter';
import { DragHandlerEvents } from '../input/dragHandler';
import { Core } from '../core';

export interface ViewOptions {
    nodeTemplateProvider?: TemplateProvider<Node>;
    linkTemplateProvider?: TemplateProvider<Link>;
}

export interface DiagramViewProps {
    model: DiagramModel;
    core: Core;
    onViewMount?: (view: DiagramView) => void;
    viewOptions?: ViewOptions;
    dragHandlers?: Subscribable<DragHandlerEvents>[];
}

export interface CameraState {
    position: Vector3d;
    focusDirection?: Vector3d;
}

export const DEFAULT_CAMERA_DIST = 100;
export const DEFAULT_SCREEN_PARAMETERS = {
    VIEW_ANGLE: 45,
    NEAR: 0.1,
    FAR: 10000,
};

export class DiagramView extends React.Component<DiagramViewProps> {
    private highlighter: ElementHighlighter;
    private dragHandlers: Subscribable<DragHandlerEvents>[];

    core: Core;
    graphView: GraphView;
    widgetsView: WidgetsView<any>;

    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;

    constructor(props: DiagramViewProps) {
        super(props);
        this.core = props.core;
        this.highlighter = new ElementHighlighter(this);
    }

    componentDidMount() {
        this.core.vrManager.on('connection:state:changed', () => {
            this.widgetsView.update();
        });
        this.initSubViews();
        this.subscribeOnModel();
        this.subscribeOnHandlers();

        this.core.attachTo(this.meshHtmlContainer, this.overlayHtmlContainer);

        if (this.props.onViewMount) {
            this.props.onViewMount(this);
        }
    }

    componentDidUpdate() {
        this.subscribeOnHandlers();
    }

    private initSubViews() {
        const viewOptions = this.props.viewOptions || {};
        this.graphView = new GraphView({
            vrManager: this.core.vrManager,
            graphModel: this.props.model.graph,
            nodeTemplateProvider: viewOptions.nodeTemplateProvider,
            linkTemplateProvider: viewOptions.linkTemplateProvider,
            onAdd3dObject: object => this.core.scene.add(object),
            onRemove3dObject: object => this.core.scene.remove(object),
        });
        this.widgetsView = new WidgetsView({
            diagramView: this,
            vrManager: this.core.vrManager,
            widgetsModel: this.props.model.widgetRegistry,
            onAdd3dObject: object => this.core.scene.add(object),
            onRemove3dObject: object => this.core.scene.remove(object),
        });
    }

    private subscribeOnModel() {
        const {model} = this.props;
        model.on('syncupdate', combinedEvent => {
            const { nodeEvents, linkEvents, widgetEvents } = combinedEvent.data;

            const updatedNodeIds: NodeId[] = [];
            nodeEvents.forEach(event => {
                switch (event.type) {
                    case 'add:node':
                        this.graphView.registerNode(event.target);
                        break;
                    case 'remove:node':
                        this.graphView.removeNodeView(event.target);
                        break;
                    case 'update:node':
                        updatedNodeIds.push(event.target.id);
                        break;
                }
            });

            const updatedLinkIds: LinkId[] = [];
            linkEvents.forEach(event => {
                switch (event.type) {
                    case 'add:link':
                        this.graphView.registerLink(event.target);
                        break;
                    case 'remove:link':
                        this.graphView.removeLinkView(event.target);
                        break;
                    case 'update:link':
                        updatedLinkIds.push(event.target.id);
                        break;
                }
            });

            const updatedWidgetIds: string[] = [];
            widgetEvents.forEach(event => {
                switch (event.type) {
                    case 'add:widget':
                        this.widgetsView.registerWidgetViewForModel(event.target);
                        break;
                    case 'remove:widget':
                        this.widgetsView.removeWidgetViewOfModel(event.target);
                        break;
                    case 'update:widget':
                        const widget: Widget = event.target;
                        updatedWidgetIds.push(widget.widgetId);
                        break;
                }
            });

            this.graphView.update({updatedNodeIds, updatedLinkIds});
            this.widgetsView.update(updatedWidgetIds);

            this.core.forceRender();
        });
    }

    private subscribeOnHandlers() {
        const {dragHandlers, core} = this.props;
        if (!dragHandlers || this.dragHandlers) { return; }
        this.dragHandlers = dragHandlers;
        for (const dragHandler of this.dragHandlers) {
            dragHandler.on('elementHoverStart', e => {
                this.highlighter.highlight(e.data.target);
                this.core.forceRender();
            });
            dragHandler.on('elementHoverEnd', e => {
                this.highlighter.clear(e.data.target);
                this.core.forceRender();
            });
        }
    }

    render() {
        return <div className='l3graph-main_screen'>
            <div
                className='l3graph-main_screen__mesh-layer'
                ref={div => this.meshHtmlContainer = div}
            >
            </div>
            <div
                className='l3graph-main_screen__overlay-layer'
                ref={div => this.overlayHtmlContainer = div}
            >
            </div>
        </div>;
    }
}
