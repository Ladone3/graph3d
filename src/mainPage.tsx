import * as React from 'react';
import * as THREE from 'three';

export interface MainPageProps {

}

export interface MainPageState {

}

export class MainPage extends React.Component<MainPageProps, MainPageState> {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private sceneHtmlContainer: HTMLElement;

    componentDidMount() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.sceneHtmlContainer.appendChild(this.renderer.domElement);

        this.scene.background = new THREE.Color(0x999999);

        var planeGeometry = new THREE.PlaneGeometry(15,15);
        var planeMaterial = new THREE.MeshLambertMaterial(
            {color: 0xffffff});
        var plane = new THREE.Mesh(planeGeometry,planeMaterial);
        plane.rotation.x=-0.5*Math.PI;
        plane.position.x = 0;
        plane.position.y = 0;
        plane.position.z = 0;
        this.scene.add(plane);

        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial( { shininess: 1, color: 0x00ff00 } );
        const cube = new THREE.Mesh(cubeGeometry, material);
        cube.position.x = 0;
        cube.position.y = 1;
        cube.position.z = 0;
        this.scene.add(cube);

        // camera.position.z = 5;

        // function animate() {
        //     cube.rotation.x += 0.01;
        //     cube.rotation.y += 0.01;
        //     requestAnimationFrame( animate );
        //     renderer.render( scene, camera );
        // }
        // animate();

        // var axes = new THREE.AxisHelper( 20 );
        // scene.add(axes);
        // var planeGeometry = new THREE.PlaneGeometry(60,20);
        // var planeMaterial = new THREE.MeshLambertMaterial(
        // 	{color: 0xffffff});
        // var plane = new THREE.Mesh(planeGeometry,planeMaterial);
        // plane.rotation.x=-0.5*Math.PI;
        // plane.position.x = 15;
        // plane.position.y = 0;
        // plane.position.z = 0;
        // scene.add(plane);

        var cubeGeometry1 = new THREE.CubeGeometry(4,4,4);
        var cubeMaterial = new THREE.MeshLambertMaterial(
        	{color: 0xff0000});
        var cube1 = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.x = -4;
        cube.position.y = 3;
        cube.position.z = 0;
        this.scene.add(cube1);

        var sphereGeometry = new THREE.SphereGeometry(4,20,20);
        var sphereMaterial = new THREE.MeshLambertMaterial(
            {color: 0x7777ff});
        var sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);
        sphere.position.x = 10;
        sphere.position.y = 4;
        sphere.position.z = 1;
        this.scene.add(sphere);

        var spotLight = new THREE.SpotLight( 0xffffff );
        spotLight.position.set( -40, 60, -10 );
        this.scene.add(spotLight );

        this.camera.position.x = -10;
        this.camera.position.y = 10;
        this.camera.position.z = 10;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);

        let angle = 0;
        const cameraDist = 10;
        const cameraStep = 0.04;

        const animate = () => {
            angle += cameraStep;
            this.camera.position.x = Math.sin(angle) * cameraDist;
            this.camera.position.y = Math.abs(Math.sin(angle)) * cameraDist;
            this.camera.position.z = Math.cos(angle) * cameraDist;
            this.camera.lookAt(this.scene.position);
            this.renderer.render(this.scene, this.camera);
            setTimeout(() => requestAnimationFrame(animate), 40);
        };
        animate();

    }

    render() {
        return <div
            className='o3d-main'
            ref={(div) => this.sceneHtmlContainer = div}
        >
        </div>;
    }
}
