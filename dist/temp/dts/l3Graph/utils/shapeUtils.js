"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var templates_1 = require("../templates");
function getPrimitive(primitive) {
    if (!templates_1.isMeshPrimitive(primitive)) {
        throw new Error('Not a prmitive mesh was passed into function!');
    }
    var color = primitive.color || Math.random() * 0xffffff;
    var material = new THREE.MeshPhongMaterial({ color: color });
    var geometry;
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
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0;
    return mesh;
}
exports.getPrimitive = getPrimitive;
