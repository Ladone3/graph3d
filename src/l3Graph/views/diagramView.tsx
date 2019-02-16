import * as React from 'react';
import * as THREE from 'three';
import { Vector3D } from '../models/primitives';
import { NodeTemplateProvider, LinkTemplateProvider } from '../templates';
import { GraphView } from './graphView';
import { DiagramModel } from '../models/diagramModel';
import { Element } from '../models/graphModel';
import { WidgetsView } from './widgetsView';
import { Widget } from '../models/widget';

export interface DiagramViewProps {
    model: DiagramModel;
    onViewMount?: (view: DiagramView) => void;
    // todo: separate it
    nodeTemplateProvider?: NodeTemplateProvider;
    linkTemplateProvider?: LinkTemplateProvider;
}

export interface CameraState {
    position: Vector3D;
    focusDirection?: Vector3D;
}

export const CAMERA_DIST = 100;

export class DiagramView extends React.Component<DiagramViewProps> {
    private renderer: THREE.WebGLRenderer;
    private overlayRenderer: THREE.CSS3DRenderer;

    graphView: GraphView;
    widgetsView: WidgetsView;

    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;

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
        if (this.props.onViewMount) {
            this.props.onViewMount(this);
        }
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
        this.scene.fog = new THREE.FogExp2(0xffffff, 0.0003);

        // Prepare perspective camera
        this.screenParameters = {
            WIDTH: this.meshHtmlContainer.clientWidth,
            HEIGHT: this.meshHtmlContainer.clientHeight,
            VIEW_ANGLE: 45,
            ASPECT: this.meshHtmlContainer.clientWidth / this.meshHtmlContainer.clientHeight,
            NEAR: 1,
            FAR: 10000,
        };

        this.camera = new THREE.PerspectiveCamera(
            this.screenParameters.VIEW_ANGLE,
            this.screenParameters.ASPECT,
            this.screenParameters.NEAR,
            this.screenParameters.FAR,
        );
        this.camera.position.set(0, 0, CAMERA_DIST);
        this.camera.lookAt(this.scene.position);
        this.scene.add(this.camera);

        // Helper plane
        const planeGeometry = new THREE.PlaneGeometry(200, 200, 10, 10);
        const planeMaterial = new THREE.MeshBasicMaterial({wireframe: true, color: 0x000000});
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -0.5 * Math.PI;
        plane.position.x = 0;
        plane.position.y = -100;
        plane.position.z = 0;
        this.scene.add(plane);

        // Add lights
        const dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(200, 200, 1000).normalize();
        this.scene.add(new THREE.AmbientLight(0x444444));
        this.camera.add(dirLight);
        this.camera.add(dirLight.target);

        // Prepare webgl renderer
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(
            this.screenParameters.WIDTH,
            this.screenParameters.HEIGHT,
        );
        this.renderer.render(this.scene, this.camera);
        this.renderer.setClearColor(this.scene.fog.color);

        // Prepare sprite renderer (css3d)
        this.overlayRenderer = new THREE.CSS3DRenderer();
        this.overlayRenderer.setSize(
            this.screenParameters.WIDTH,
            this.screenParameters.HEIGHT,
        );
        this.overlayRenderer.render(this.scene, this.camera);

        this.meshHtmlContainer.appendChild(this.renderer.domElement);
        this.overlayHtmlContainer.appendChild(this.overlayRenderer.domElement);
    }

    private initSubViews() {
        this.graphView = new GraphView({
            graphModel: this.props.model.graph,
            scene: this.scene,
            nodeTemplateProvider: this.props.nodeTemplateProvider,
            linkTemplateProvider: this.props.linkTemplateProvider,
        });
        this.widgetsView = new WidgetsView({
            widgetsModel: this.props.model.widgets,
            scene: this.scene,
        });
    }

    private subscribeOnModel() {
        this.props.model.on('syncupdate', combinedEvent => {
            const events = combinedEvent.data;

            const updatedElementIds: string[] = [];
            events.graphEvents.forEach((event: Element, id: string) => {
                updatedElementIds.push(id);
            });

            const updatedWidgetIds: string[] = [];
            events.widgetEvents.forEach((event: Widget, id: string) => {
                updatedWidgetIds.push(id);
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
        return <div className='o3d-main_screen'>
            <div
                className='o3d-main_screen__mesh-layer'
                ref={(div) => this.meshHtmlContainer = div}
            >
            </div>
            <div
                className='o3d-main_screen__overlay-layer'
                ref={(div) => this.overlayHtmlContainer = div}
            >
            </div>
        </div>;
    }
}
