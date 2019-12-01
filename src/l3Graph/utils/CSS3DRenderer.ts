import * as THREE from 'three';

/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/
 * @author yomotsu / https://yomotsu.net/
 */

export class CSS3DObject extends THREE.Object3D {
	constructor (public element: HTMLElement) {
		super();

		element.style.position = 'absolute';
		this.addEventListener( 'removed', function () {
			if (element.parentNode !== null ) {
				element.parentNode.removeChild(element);
			}
		});
	}
};

export class CSS3DSprite extends CSS3DObject {
	constructor (public element: HTMLElement) {
		super(element);
	}
};

export class CSS3DRenderer {
	_width: number;
	_height: number;
	_widthHalf: number;
	_heightHalf: number;

	matrix = new THREE.Matrix4();

	cache = {
		camera: { fov: 0, style: '' },
		objects: new WeakMap()
	};

	domElement: HTMLDivElement;
	cameraElement: HTMLDivElement;
	isIE: boolean;
	constructor() {
		console.log( 'THREE.CSS3DRenderer', THREE.REVISION );
		this.domElement = document.createElement('div');
		this.domElement.style.overflow = 'hidden';

		this.cameraElement = document.createElement('div');
		(this.cameraElement.style as any).WebkitTransformStyle = 'preserve-3d';
		this.cameraElement.style.transformStyle = 'preserve-3d';
	
		this.domElement.appendChild(this.cameraElement);
		this.isIE = /Trident/i.test( navigator.userAgent );
	}

	getSize() {
		return {
			width: this._width,
			height: this._height,
		};
	};

	setSize(width: number, height: number) {
		this._width = width;
		this._height = height;
		this._widthHalf = this._width / 2;
		this._heightHalf = this._height / 2;

		this.domElement.style.width = width + 'px';
		this.domElement.style.height = height + 'px';

		this.cameraElement.style.width = width + 'px';
		this.cameraElement.style.height = height + 'px';

	};

	private getObjectCSSMatrix(matrix: THREE.Matrix4, cameraCSSMatrix: string) {
		const elements = matrix.elements;
		const matrix3d = 'matrix3d(' +
			epsilon( elements[ 0 ] ) + ',' +
			epsilon( elements[ 1 ] ) + ',' +
			epsilon( elements[ 2 ] ) + ',' +
			epsilon( elements[ 3 ] ) + ',' +
			epsilon( - elements[ 4 ] ) + ',' +
			epsilon( - elements[ 5 ] ) + ',' +
			epsilon( - elements[ 6 ] ) + ',' +
			epsilon( - elements[ 7 ] ) + ',' +
			epsilon( elements[ 8 ] ) + ',' +
			epsilon( elements[ 9 ] ) + ',' +
			epsilon( elements[ 10 ] ) + ',' +
			epsilon( elements[ 11 ] ) + ',' +
			epsilon( elements[ 12 ] ) + ',' +
			epsilon( elements[ 13 ] ) + ',' +
			epsilon( elements[ 14 ] ) + ',' +
			epsilon( elements[ 15 ] ) +
		')';
	
		if (this.isIE) {
			return 'translate(-50%,-50%)' +
				'translate(' + this._widthHalf + 'px,' + this._heightHalf + 'px)' +
				cameraCSSMatrix +
				matrix3d;
		}
	
		return 'translate(-50%,-50%)' + matrix3d;
	}

	private renderObject(object: THREE.Object3D, camera: THREE.Camera, cameraCSSMatrix: string) {
		if (object instanceof CSS3DObject) {

			let style;

			if (object instanceof CSS3DSprite) {

				this.matrix.copy( camera.matrixWorldInverse );
				this.matrix.transpose();
				this.matrix.copyPosition( object.matrixWorld );
				this.matrix.scale( object.scale );

				this.matrix.elements[ 3 ] = 0;
				this.matrix.elements[ 7 ] = 0;
				this.matrix.elements[ 11 ] = 0;
				this.matrix.elements[ 15 ] = 1;

				style = this.getObjectCSSMatrix(this.matrix, cameraCSSMatrix);
			} else {
				style = this.getObjectCSSMatrix(object.matrixWorld, cameraCSSMatrix);
			}

			const element = object.element;
			const cachedStyle = this.cache.objects.get(object);

			if (cachedStyle === undefined || cachedStyle !== style) {
				(element.style as any).WebkitTransform = style;
				element.style.transform = style;

				const objectData = {style: style, distanceToCameraSquared: 0};

				if (this.isIE) {
					objectData.distanceToCameraSquared = getDistanceToSquared( camera, object );
				}

				this.cache.objects.set(object, objectData);
			}

			if (element.parentNode !== this.cameraElement) {
				this.cameraElement.appendChild(element);
			}

		}

		for (let i = 0, l = object.children.length; i < l; i ++) {
			this.renderObject(object.children[i], camera, cameraCSSMatrix );
		}

	}

	private zOrder(scene: THREE.Scene) {
		const sorted = filterAndFlatten(scene).sort((a, b) => {
			const distanceA = this.cache.objects.get(a).distanceToCameraSquared;
			const distanceB = this.cache.objects.get(b).distanceToCameraSquared;

			return distanceA - distanceB;
		});

		const zMax = sorted.length;

		for (let i = 0, l = sorted.length; i < l; i ++) {
			sorted[i].element.style.zIndex = `${zMax - i}`;
		}

	}

	render(scene: THREE.Scene, camera: THREE.Camera) {
		const fov = camera.projectionMatrix.elements[ 5 ] * this._heightHalf;
		if (this.cache.camera.fov !== fov) {
			if ((camera as any).isPerspectiveCamera) {
				(this.domElement.style as any).WebkitPerspective = fov + 'px';
				this.domElement.style.perspective = fov + 'px';
			}

			this.cache.camera.fov = fov;
		}

		scene.updateMatrixWorld();

		if (camera.parent === null) { camera.updateMatrixWorld(); }

		const cameraCSSMatrix = (camera as any).isOrthographicCamera ?
			`scale(${fov})${getCameraCSSMatrix(camera.matrixWorldInverse)}` :
			`translateZ(${fov}px)${getCameraCSSMatrix(camera.matrixWorldInverse)}`;

		const style = cameraCSSMatrix +
			`translate(${this._widthHalf}px,${this._heightHalf}px)`;

		if (this.cache.camera.style !== style && !this.isIE) {
			(this.cameraElement.style as any).WebkitTransform = style;
			this.cameraElement.style.transform = style;
			this.cache.camera.style = style;
		}

		this.renderObject(scene, camera, cameraCSSMatrix);

		if (this.isIE) {

			// IE10 and 11 does not support 'preserve-3d'.
			// Thus, z-order in 3D will not work.
			// We have to calc z-order manually and set CSS z-index for IE.
			// FYI: z-index can't handle object intersection
			this.zOrder(scene);
		}
	};

};

function filterAndFlatten(scene: THREE.Scene) {
	const result: CSS3DObject[] = [];

	scene.traverse(object => {
		if (object instanceof CSS3DObject) {
			result.push(object);
		}
	});

	return result;

}

function getDistanceToSquared(object1: THREE.Object3D, object2: THREE.Object3D) {
	const a = new THREE.Vector3();
	const b = new THREE.Vector3();
	a.setFromMatrixPosition(object1.matrixWorld);
	b.setFromMatrixPosition(object2.matrixWorld);

	return a.distanceToSquared( b );
}

function epsilon(value: number) {
	return Math.abs( value ) < 1e-10 ? 0 : value;

}

function getCameraCSSMatrix(matrix: THREE.Matrix4) {
	const elements = matrix.elements;

	return 'matrix3d(' +
		epsilon( elements[ 0 ] ) + ',' +
		epsilon( - elements[ 1 ] ) + ',' +
		epsilon( elements[ 2 ] ) + ',' +
		epsilon( elements[ 3 ] ) + ',' +
		epsilon( elements[ 4 ] ) + ',' +
		epsilon( - elements[ 5 ] ) + ',' +
		epsilon( elements[ 6 ] ) + ',' +
		epsilon( elements[ 7 ] ) + ',' +
		epsilon( elements[ 8 ] ) + ',' +
		epsilon( - elements[ 9 ] ) + ',' +
		epsilon( elements[ 10 ] ) + ',' +
		epsilon( elements[ 11 ] ) + ',' +
		epsilon( elements[ 12 ] ) + ',' +
		epsilon( - elements[ 13 ] ) + ',' +
		epsilon( elements[ 14 ] ) + ',' +
		epsilon( elements[ 15 ] ) +
	')';
}