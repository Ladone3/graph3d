import * as THREE from 'three';
import { MeshKind, MeshPrimitive, MeshObj } from '../customisation';

export function preparePrimitive(primitive: MeshPrimitive): THREE.Mesh {
    if (primitive.type !== MeshKind.Primitive) {
        throw new Error('Not a prmitive mesh was passed into function!');
    }
    const color = primitive.color || Math.random() * 0xffffff;
    const material = new THREE.MeshPhongMaterial({color});
    let geometry: THREE.Geometry;

    switch (primitive.shape) {
        case 'cube':
            geometry = new THREE.CubeGeometry(10, 10, 10);
            break;
        case 'cone':
            geometry = new THREE.ConeGeometry(5, 10, 10);
            break;
        case 'cylinder':
            geometry = new THREE.CylinderGeometry(5, 5, 10, 10);
            break;
        case 'dodecahedron':
            geometry = new THREE.DodecahedronGeometry(10);
            break;
        case 'torus':
            geometry = new THREE.TorusGeometry(10, 2, 10, 20);
            break;
        case 'tetrahedron':
            geometry = new THREE.TetrahedronGeometry(5);
            break;
        case 'plane':
            geometry = new THREE.PlaneGeometry(10, 10, 2);
            material.side = THREE.DoubleSide;
            break;
        case 'sphere':
        default:
            geometry = new THREE.SphereGeometry(5, 10, 10);
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0;

    return mesh;
}

export function prepareMesh(meshObj: MeshObj): THREE.Group {
    const color = meshObj.color || Math.random() * 0xffffff;
    const loader = new THREE.OBJLoader();
    const mesh = loader.parse(meshObj.markup);

    const material = new THREE.MeshPhongMaterial({color});
    mesh.traverse(child => {
        if (child instanceof THREE.Mesh) { child.material = material; }
    });

    return mesh;
}
