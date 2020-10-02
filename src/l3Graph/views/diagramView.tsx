import * as React from 'react';
import * as THREE from 'three';
import { Vector3d, Vector2d } from '../models/structures';
import { TemplateProvider } from '../customization';
import { GraphView } from './graph/graphView';
import { DiagramModel } from '../models/diagramModel';
import { WidgetsView } from './widgets/widgetsView';
import { Widget } from '../models/widgets/widget';
import { vector3dToTreeVector3, eventToPosition, Subscribable } from '../utils';
import { VrManager } from '../vrUtils/vrManager';
import { CSS3DRenderer } from '../utils/CSS3DRenderer';
import { NodeId, Node } from '../models/graph/node';
import { LinkId, Link } from '../models/graph/link';
import { ElementHighlighter } from '../utils/highlighter';
import { DragHandlerEvents } from '../input/dragHandler';

export interface ViewOptions {
    nodeTemplateProvider?: TemplateProvider<Node>;
    linkTemplateProvider?: TemplateProvider<Link>;
}

export interface DiagramViewProps {
    model: DiagramModel;
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

    renderer: THREE.WebGLRenderer;
    overlayRenderer: CSS3DRenderer;

    graphView: GraphView;
    widgetsView: WidgetsView<any>;

    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;
    vrManager: VrManager;

    screenParameters: {
        WIDTH: number;
        HEIGHT: number;
        VIEW_ANGLE: number;
        ASPECT: number;
        NEAR: number;
        FAR: number;
    };

    constructor(props: DiagramViewProps) {
        super(props);
        this.highlighter = new ElementHighlighter(this);
    }

    componentDidMount() {
        this.initScene();
        this.vrManager = new VrManager(this);
        this.vrManager.on('connection:state:changed', () => {
            this.widgetsView.update();
        });
        this.initSubViews();
        this.subscribeOnModel();
        this.subscribeOnHandlers();
        this.renderGraph();

        if (this.props.onViewMount) {
            this.props.onViewMount(this);
        }
    }

    componentDidUpdate() {
        this.subscribeOnHandlers();
    }

    mouseTo3dPos(event: MouseEvent | TouchEvent, distanceFromScreen: number = 600): Vector3d {
        const bBox = this.meshHtmlContainer.getBoundingClientRect();
        return this.clientPosTo3dPos(eventToPosition(event, bBox) || {x: 0, y: 0}, distanceFromScreen);
    }

    clientPosTo3dPos(position: Vector2d, distanceFromScreen: number = 600): Vector3d {
        const cameraPos = this.camera.position;
        const screenParameters = this.screenParameters;
        const vector = new THREE.Vector3(
            (position.x / screenParameters.WIDTH) * 2 - 1,
            1 - (position.y / screenParameters.HEIGHT) * 2,
            1
        );
        const point = vector.unproject(this.camera);
        const distance = point.distanceTo(cameraPos);
        const k = distanceFromScreen / distance;

        const relativePoint: Vector3d = {
            x: point.x - cameraPos.x,
            y: point.y - cameraPos.y,
            z: point.z - cameraPos.z,
        };
        return {
            x: relativePoint.x * k + cameraPos.x,
            y: relativePoint.y * k + cameraPos.y,
            z: relativePoint.z * k + cameraPos.z,
        };
    }

    pos3dToClientPos(position: Vector3d): Vector2d {
        const treePos = vector3dToTreeVector3(position);
        const screenParameters = this.screenParameters;
        const vector = treePos.project(this.camera);
        return {
            x: (vector.x + 1) * screenParameters.WIDTH / 2,
            y: (1 - vector.y) * screenParameters.HEIGHT / 2,
        };
    }

    get cameraState(): CameraState {
        const focusDirection = new THREE.Vector3(0, 0, - 1);
        focusDirection.applyQuaternion(this.camera.quaternion);
        return {
            position: this.camera.position,
            focusDirection,
        };
    }

    set cameraState(cameraState: CameraState) {
        const {position, focusDirection} = cameraState;
        this.camera.position.x = position.x;
        this.camera.position.y = position.y;
        this.camera.position.z = position.z;

        if (focusDirection) {
            this.camera.lookAt(new THREE.Vector3(
                focusDirection.x,
                focusDirection.y,
                focusDirection.z,
            ));
        }
        this.renderGraph();
    }

    resize() {
        this.screenParameters = {
            ...this.screenParameters,
            WIDTH: this.meshHtmlContainer.clientWidth,
            HEIGHT: this.meshHtmlContainer.clientHeight,
            ASPECT: this.meshHtmlContainer.clientWidth / this.meshHtmlContainer.clientHeight,
        };
        this.renderer.setSize(
            this.screenParameters.WIDTH,
            this.screenParameters.HEIGHT,
        );
        this.overlayRenderer.setSize(
            this.screenParameters.WIDTH,
            this.screenParameters.HEIGHT,
        );
        this.camera.aspect = this.screenParameters.ASPECT;
        this.camera.updateProjectionMatrix();
        this.renderGraph();
    }

    private initScene() {
        // Create main scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(255, 255, 255);
        // this.scene.fog = new THREE.FogExp2(0xffffff, 0.0003);

        // Prepare perspective camera
        this.screenParameters = {
            ...DEFAULT_SCREEN_PARAMETERS,
            WIDTH: this.meshHtmlContainer.clientWidth,
            HEIGHT: this.meshHtmlContainer.clientHeight,
            ASPECT: this.meshHtmlContainer.clientWidth / this.meshHtmlContainer.clientHeight,
        };

        this.camera = new THREE.PerspectiveCamera(
            this.screenParameters.VIEW_ANGLE,
            this.screenParameters.ASPECT,
            this.screenParameters.NEAR,
            this.screenParameters.FAR,
        );
        this.camera.position.set(0, 0, DEFAULT_CAMERA_DIST);
        this.camera.lookAt(this.scene.position);
        this.scene.add(this.camera);

        // Add lights
        const dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(200, 200, 1000).normalize();
        this.scene.add(new THREE.AmbientLight(0x444444));
        this.camera.add(dirLight);
        this.camera.add(dirLight.target);

        // Prepare webgl renderer
        this.renderer = new THREE.WebGLRenderer({antialias: true}) as any;
        this.renderer.setSize(
            this.screenParameters.WIDTH,
            this.screenParameters.HEIGHT,
        );
        this.renderer.setClearColor('white');

        // xr
        // document.body.appendChild(VRButton.createButton(this.renderer));
        this.renderer.xr.enabled = true;

        // Prepare sprite renderer (css3d)
        this.overlayRenderer = new CSS3DRenderer();
        this.overlayRenderer.setSize(
            this.screenParameters.WIDTH,
            this.screenParameters.HEIGHT,
        );

        this.meshHtmlContainer.appendChild(this.renderer.domElement);
        this.overlayHtmlContainer.appendChild(this.overlayRenderer.domElement);

        // Helper sphere
        const sphereGeometry = new THREE.SphereGeometry(this.screenParameters.FAR / 2, 35, 35);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            wireframe: true, color: 0xf0f0f0,
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(0, 0, 0);
        this.scene.add(sphere);

        // Finalize
        this.renderer.render(this.scene, this.camera);
        this.overlayRenderer.render(this.scene, this.camera);
        this.setAnimationLoop();
    }

    private initSubViews() {
        const viewOptions = this.props.viewOptions || {};
        this.graphView = new GraphView({
            vrManager: this.vrManager,
            graphModel: this.props.model.graph,
            nodeTemplateProvider: viewOptions.nodeTemplateProvider,
            linkTemplateProvider: viewOptions.linkTemplateProvider,
            onAdd3dObject: object => this.scene.add(object),
            onRemove3dObject: object => this.scene.remove(object),
        });
        this.widgetsView = new WidgetsView({
            diagramView: this,
            vrManager: this.vrManager,
            widgetsModel: this.props.model.widgetRegistry,
            onAdd3dObject: object => this.scene.add(object),
            onRemove3dObject: object => this.scene.remove(object),
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

            this.renderGraph();
        });
    }

    private subscribeOnHandlers() {
        const {dragHandlers} = this.props;
        if (!dragHandlers || this.dragHandlers) { return; }
        this.dragHandlers = dragHandlers;
        for (const dragHandler of this.dragHandlers) {
            dragHandler.on('elementHoverStart', e => {
                this.highlighter.highlight(e.data.target);
            });
            dragHandler.on('elementHover', e => {
                this.highlighter.highlight(e.data.target);
            });
            dragHandler.on('elementHoverEnd', e => {
                this.highlighter.clear(e.data.target);
            });
        }
    }

    renderGraph() {
        this.renderer.render(this.scene, this.camera);
        this.overlayRenderer.render(this.scene, this.camera);
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

    private setAnimationLoop() {
        this.renderer.setAnimationLoop(() => {
            this.renderer.render(this.scene, this.camera);
        });
    }
}
