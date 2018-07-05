import * as React from 'react';
import * as THREE from 'three';
import { GraphModel, Element, isNode, isLink } from './model/graphModel';
import { GraphElementView, NodeView, LinkView } from './model/views';
import { Vectro3D } from './model/models';

export interface GraphViewProps {
    graphModel: GraphModel;
}

export interface GraphViewState {

}

export const CAMERA_DIST = 100;

export class GraphView extends React.Component<GraphViewProps, GraphViewState> {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private graphModel: GraphModel;
    private sceneHtmlContainer: HTMLElement;

    private views: GraphElementView[];

    constructor(props: GraphViewProps) {
        super(props);
        this.graphModel = props.graphModel;
        this.views = [];
    }

    componentDidMount() {
        this.initScene();
        this.subscribeOnModel();
    }

    private subscribeOnModel() {
        this.graphModel.on('add:elements', (elements: Element[]) => {
            for (const element of elements) {
                const newView = this.findView(element);
                if (newView) {
                    this.views.push(newView);
                    this.scene.add(newView.getMesh());
                }
            }
            this.renderGraph();
        });

        this.graphModel.on('change:camera-angle', (cameraAngle: Vectro3D) => {
            this.camera.position.x = Math.sin(cameraAngle.x) * CAMERA_DIST;
            this.camera.position.y = Math.cos(cameraAngle.y) * CAMERA_DIST;
            this.camera.position.z = Math.cos(cameraAngle.z) * CAMERA_DIST;

            this.camera.lookAt(this.scene.position);
            this.renderGraph();
        });

        // this.graphModel.on('remove:elements', () => { });
    }

    private findView(model: Element): GraphElementView | undefined {
        if (isNode(model)) {
            return new NodeView(model);
        } else if (isLink(model)) {
            return new LinkView(model);
        } else {
            return undefined;
        }
    }

    private initScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.sceneHtmlContainer.appendChild(this.renderer.domElement);

        this.scene.background = new THREE.Color(0x999999);

        const spotLight = new THREE.SpotLight( 0xffffff );
        spotLight.position.set( -40, 60, -10 );
        this.scene.add(spotLight );

        this.camera.position.x = -10;
        this.camera.position.y = 10;
        this.camera.position.z = 10;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);

        // let angle = 0;
        // const cameraDist = 100;
        // const cameraStep = 0.04;

        // const animate = () => {
        //     angle += cameraStep;
        //     this.camera.position.x = Math.sin(angle) * cameraDist;
        //     this.camera.position.y = Math.abs(Math.sin(angle)) * cameraDist;
        //     this.camera.position.z = Math.cos(angle) * cameraDist;
        //     this.camera.lookAt(this.scene.position);
        //     this.renderer.render(this.scene, this.camera);
        //     setTimeout(() => requestAnimationFrame(animate), 40);
        // };
        // animate();
    }

    renderGraph() {
        this.renderer.render(this.scene, this.camera);
    }

    render() {
        return <div
            className='o3d-main__screen'
            ref={(div) => this.sceneHtmlContainer = div}
        >
        </div>;
    }
}
