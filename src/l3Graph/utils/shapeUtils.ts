import * as THREE from 'three';
import { MeshKind, MeshPrimitive, MeshObj } from '../customisation';
import { OBJLoader } from './OBJLoader';

export function preparePrimitive(primitive: MeshPrimitive): THREE.Mesh {
    if (primitive.type !== MeshKind.Primitive) {
        throw new Error('Not a prmitive mesh was passed into function!');
    }
    const color = primitive.color || Math.random() * 0xffffff;
    const material = new THREE.MeshPhongMaterial({color});
    let geometry: THREE.Geometry;

    switch (primitive.shape) {
        case 'cube':
            geometry = new THREE.BoxGeometry(10, 10, 10);
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

export function prepareMesh(meshObj: MeshObj): THREE.Object3D {
    const color = meshObj.color || Math.random() * 0xffffff;
    const loader = new OBJLoader();
    const mesh = loader.parse(meshObj.markup);

    // todo: try this way
    // const group = new THREE.Group();
    // group.add(mesh);
    // setColor(group, color);
    // return group;

    setColor(mesh, color);
    return mesh;
}

/** Helper only for phong and line basic material */
export function setColor(
    mesh: THREE.Object3D,
    providedColor: string | number | Map<THREE.Object3D, string | number>
) {
    const color = (
        typeof providedColor === 'string' ||
        typeof providedColor === 'number'
    ) ? providedColor : providedColor.get(mesh);
    if (mesh instanceof THREE.Line) {
        mesh.material = new THREE.LineBasicMaterial({color});
    } else if (mesh instanceof THREE.Group) {
        mesh.children.forEach(child => setColor(child, providedColor));
    } else if (mesh instanceof THREE.Mesh) {
        mesh.material = new THREE.MeshPhongMaterial({color});
    }
}

export function setMaterial(
    mesh: THREE.Object3D,
    material: THREE.Material,
) {
    if (mesh instanceof THREE.Group) {
        mesh.children.forEach(child => setMaterial(child, material));
    } else if (mesh instanceof THREE.Mesh) {
        mesh.material = material;
    }
}

export function backupColors(mesh: THREE.Object3D): Map<THREE.Object3D, THREE.Material | THREE.Material[]> {
    const backUp = new Map<THREE.Object3D, THREE.Material | THREE.Material[]>();
    const recursion = (curMesh: THREE.Object3D) => {
        if (curMesh instanceof THREE.Group) {
            curMesh.children.forEach(child => recursion(child));
        } else if (curMesh instanceof THREE.Mesh || curMesh instanceof THREE.Line) {
            backUp.set(curMesh, curMesh.material);
        }
    };
    recursion(mesh);
    return backUp;
}

export function restoreColors(mesh: THREE.Object3D, backUp: Map<THREE.Object3D, THREE.Material | THREE.Material[]>) {
     if (mesh instanceof THREE.Group) {
        mesh.children.forEach(child => restoreColors(child, backUp));
    } else if (mesh instanceof THREE.Line || mesh instanceof THREE.Mesh) {
        mesh.material = backUp.get(mesh);
    }
}
