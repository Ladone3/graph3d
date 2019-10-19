import * as React from 'react';
import * as THREE from 'three';
import { Vector3D, Vector2D } from '../models/structures';
import { NodeTemplateProvider, LinkTemplateProvider } from '../customisation';
import { GraphView } from './graph/graphView';
import { DiagramModel } from '../models/diagramModel';
import { Element, GraphModelEvents } from '../models/graph/graphModel';
import { WidgetsView } from './widgets/widgetsView';
import { Widget } from '../models/widgets/widget';
import { vector3DToTreeVector3, EventObject, eventToPosition } from '../utils';
import { WidgetsModelEvents } from '../models/widgets/widgetsModel';
import { WebGLRenderer } from '../vrUtils/webVr';
import { VrManager } from '../vrUtils/vrManager';

export interface ViewOptions {
    nodeTemplateProvider?: NodeTemplateProvider;
    linkTemplateProvider?: LinkTemplateProvider;
}

export interface DiagramViewProps {
    model: DiagramModel;
    onViewMount?: (view: DiagramView) => void;
    viewOptions?: ViewOptions;
}

export interface CameraState {
    position: Vector3D;
    focusDirection?: Vector3D;
}

export const DEFAULT_CAMERA_DIST = 100;

export class DiagramView extends React.Component<DiagramViewProps> {
    renderer: WebGLRenderer;
    overlayRenderer: THREE.CSS3DRenderer;

    graphView: GraphView;
    widgetsView: WidgetsView;

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
    }

    componentDidMount() {
        this.initScene();
        this.initSubViews();
        this.subscribeOnModel();
        this.renderGraph();
        this.vrManager = new VrManager(this);
        this.vrManager.on('presenting:state:changed', () => {
            this.widgetsView.update();
        })
        if (this.props.onViewMount) {
            this.props.onViewMount(this);
        }
    }

    mouseTo3dPos(event: MouseEvent | TouchEvent, distanceFromScreen: number = 600): Vector3D {
        const bbox = this.meshHtmlContainer.getBoundingClientRect();
        return this.clientPosTo3dPos(eventToPosition(event, bbox) || {x: 0, y: 0}, distanceFromScreen);
    }

    clientPosTo3dPos(position: Vector2D, distanceFromScreen: number = 600): Vector3D {
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

        const relativePoint: Vector3D = {
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

    pos3dToClientPos(position: Vector3D): Vector2D {
        const treePos = vector3DToTreeVector3(position);
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

    private initScene() {
        // Create main scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(255, 255, 255);
        // this.scene.fog = new THREE.FogExp2(0xffffff, 0.0003);

        // Prepare perspective camera
        this.screenParameters = {
            WIDTH: this.meshHtmlContainer.clientWidth,
            HEIGHT: this.meshHtmlContainer.clientHeight,
            VIEW_ANGLE: 45,
            ASPECT: this.meshHtmlContainer.clientWidth / this.meshHtmlContainer.clientHeight,
            NEAR: 0.1,
            FAR: 10000,
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

        // Prepare sprite renderer (css3d)
        this.overlayRenderer = new THREE.CSS3DRenderer();
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
    }

    private initSubViews() {
        const viewOptions = this.props.viewOptions || {};
        this.graphView = new GraphView({
            graphModel: this.props.model.graph,
            scene: this.scene,
            nodeTemplateProvider: viewOptions.nodeTemplateProvider,
            linkTemplateProvider: viewOptions.linkTemplateProvider,
        });
        this.widgetsView = new WidgetsView({
            graphView: this.graphView,
            widgetsModel: this.props.model.widgetRegistry,
            scene: this.scene,
            renderer: this.renderer,
        });
    }

    private subscribeOnModel() {
        this.props.model.on('syncupdate', combinedEvent => {
            const events = combinedEvent.data;

            const updatedElementIds: string[] = [];
            events.graphEvents.forEach((event: EventObject<keyof GraphModelEvents, any>) => {
                switch (event.eventId) {
                    case 'add:elements':
                        for (const el of event.data) {
                            this.graphView.registerElement(el);
                        }
                        break;
                    case 'remove:elements':
                        for (const el of event.data) {
                            this.graphView.removeElementView(el);
                        }
                        break;
                    case 'update:element':
                        const element: Element = event.data;
                        updatedElementIds.push(element.id);
                        break;
                }
            });

            const updatedWidgetIds: string[] = [];
            events.widgetEvents.forEach((event: EventObject<keyof WidgetsModelEvents, any>) => {
                switch (event.eventId) {
                    case 'add:widget':
                        this.widgetsView.registerWidgetViewForModel(event.data);
                        break;
                    case 'remove:widget':
                        this.widgetsView.removeWidgetViewOfModel(event.data);
                        break;
                    case 'update:widget':
                        const widget: Widget = event.data;
                        updatedWidgetIds.push(widget.widgetId);
                        break;
                }
            });

            this.graphView.update(updatedElementIds);
            this.widgetsView.update(updatedWidgetIds);

            this.renderGraph();
        });
    }

    renderGraph() {
        this.renderer.render(this.scene, this.camera);
        this.overlayRenderer.render(this.scene, this.camera);
    }

    render() {
        return <div className='l3graph-main_screen'>
            <div
                className='l3graph-main_screen__mesh-layer'
                ref={(div) => this.meshHtmlContainer = div}
            >
            </div>
            <div
                className='l3graph-main_screen__overlay-layer'
                ref={(div) => this.overlayHtmlContainer = div}
            >
            </div>
        </div>;
    }
}
