Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var customization_1 = require("../customization");
var OBJLoader_1 = require("./OBJLoader");
function preparePrimitive(primitive) {
    if (primitive.type !== customization_1.MeshKind.Primitive) {
        throw new Error('Not a prmitive mesh was passed into function!');
    }
    var color = primitive.color || Math.random() * 0xffffff;
    var material = new THREE.MeshPhongMaterial({ color: color });
    var geometry;
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
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0;
    return mesh;
}
exports.preparePrimitive = preparePrimitive;
function prepareMesh(meshObj) {
    var color = meshObj.color || Math.random() * 0xffffff;
    var loader = new OBJLoader_1.OBJLoader();
    var mesh = loader.parse(meshObj.markup);
    setColor(mesh, color);
    return mesh;
}
exports.prepareMesh = prepareMesh;
function setColor(mesh, providedColor) {
    var color = (typeof providedColor === 'string' ||
        typeof providedColor === 'number') ? providedColor : providedColor.get(mesh);
    if (mesh instanceof THREE.Line) {
        mesh.material = new THREE.LineBasicMaterial({ color: color });
    }
    else if (mesh instanceof THREE.Group) {
        mesh.children.forEach(function (child) { return setColor(child, providedColor); });
    }
    else if (mesh instanceof THREE.Mesh) {
        mesh.material = new THREE.MeshPhongMaterial({ color: color });
    }
}
exports.setColor = setColor;
function setMaterial(mesh, material) {
    if (mesh instanceof THREE.Group) {
        mesh.children.forEach(function (child) { return setMaterial(child, material); });
    }
    else if (mesh instanceof THREE.Mesh) {
        mesh.material = material;
    }
}
exports.setMaterial = setMaterial;
function backupColors(mesh) {
    var backUp = new Map();
    var recursion = function (curMesh) {
        if (curMesh instanceof THREE.Group) {
            curMesh.children.forEach(function (child) { return recursion(child); });
        }
        else if (curMesh instanceof THREE.Mesh || curMesh instanceof THREE.Line) {
            backUp.set(curMesh, curMesh.material);
        }
    };
    recursion(mesh);
    return backUp;
}
exports.backupColors = backupColors;
function restoreColors(mesh, backUp) {
    if (mesh instanceof THREE.Group) {
        mesh.children.forEach(function (child) { return restoreColors(child, backUp); });
    }
    else if (mesh instanceof THREE.Line || mesh instanceof THREE.Mesh) {
        mesh.material = backUp.get(mesh);
    }
}
exports.restoreColors = restoreColors;
