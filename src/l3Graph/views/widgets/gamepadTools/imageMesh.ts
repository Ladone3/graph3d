import * as THREE from 'three';

import { Vector2d } from '../../../models/structures';

const DEFAULT_SIZE: Vector2d = { x: 20, y: 20 };
const BORDER_WIDTH = 1;
const DISPLAY_SCALE = 10000;
const DEFAULT_DISPLAY_MATERIAL = new THREE.MeshLambertMaterial({color: 'grey', side: THREE.DoubleSide});

export interface ImageMeshParameters {
    size?: Partial<Vector2d>;
    image?: HTMLImageElement;
}

export class ImageMesh extends THREE.Group {
    private image: HTMLImageElement;
    private size: Partial<Vector2d>;
    private plane: THREE.Mesh;
    private borderPlane: THREE.Mesh;

    constructor(parameters: ImageMeshParameters = {}) {
        super();
        this.image = parameters.image;
        this.size = parameters.size || DEFAULT_SIZE;
        this.borderPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            DEFAULT_DISPLAY_MATERIAL,
        );
        this.add(this.borderPlane);
        this.render();
    }

    public setImage(image: HTMLImageElement | undefined) {
        this.image = image;
        this.render();
    }

    public setPreferredSize(size: Vector2d | undefined) {
        this.size = size || DEFAULT_SIZE;
        this.render();
    }

    private render() {
        if (this.plane) {
            this.remove(this.plane);
        }
        let plane: THREE.Mesh;
        if (this.image) {
            const scalerX = this.size.x ? (this.size.x / this.image.width) * DISPLAY_SCALE : 1;
            const scalerY = this.size.y ? (this.size.y / this.image.height) * DISPLAY_SCALE : 1;
            const scaler = Math.min(scalerX, scalerY);

            const texture = new THREE.Texture(this.image);
            texture.anisotropy = 16;
            texture.needsUpdate = true;
            const actualSize = {
                width: this.image.width * scaler,
                height: this.image.height * scaler,
            };
            plane = new THREE.Mesh(
                new THREE.PlaneGeometry(actualSize.width, actualSize.height),
                new THREE.MeshLambertMaterial({map: texture, side: THREE.DoubleSide}),
            );

            plane.scale.setScalar(1 / DISPLAY_SCALE);
            plane.position.set(0, 0, 0);
            this.add(plane);
            this.plane = plane;

            this.borderPlane.scale.set(
                actualSize.width / DISPLAY_SCALE + BORDER_WIDTH,
                actualSize.height / DISPLAY_SCALE + BORDER_WIDTH,
                1
            );
            this.borderPlane.position.set(0, 0, -0.05);
        } else {
            this.plane = undefined;
            this.borderPlane.scale.set(
                DEFAULT_SIZE.x,
                DEFAULT_SIZE.y,
                1
            );
            this.borderPlane.position.set(0, 0, -0.05);
        }
    }
}
