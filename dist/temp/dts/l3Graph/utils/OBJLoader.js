"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
/**
 * Basedon mrdoob / http://mrdoob.com/
 * The file is a trashy version of the js-original.
 * Didn't have enough time to properly transfer from js to ts,
 * so there are a lot of ugly things here, but the functionality
 * is provided and it works fine.
 */
// o object_name | g group_name
var OBJECT_PATTERN = /^[og]\s*(.+)?/;
// mtllib file_reference
var MATERIAL_LIBRARY_PATTERN = /^mtllib /;
// usemtl material_name
var MATERIAL_USE_PATTERN = /^usemtl /;
function createEmptyMaterial(name, smooth) {
    return new MockMaterial(undefined, name, undefined, smooth, undefined, undefined, undefined, undefined);
}
var MockMaterial = /** @class */ (function () {
    function MockMaterial(index, name, mtllib, smooth, groupStart, groupEnd, groupCount, inherited) {
        this.index = index;
        this.name = name;
        this.mtllib = mtllib;
        this.smooth = smooth;
        this.groupStart = groupStart;
        this.groupEnd = groupEnd;
        this.groupCount = groupCount;
        this.inherited = inherited;
    }
    MockMaterial.prototype.clone = function (index) {
        return new MockMaterial((typeof index === 'number' ? index : this.index), this.name, this.mtllib, this.smooth, 0, -1, -1, false);
    };
    return MockMaterial;
}());
var ObjObject = /** @class */ (function () {
    function ObjObject(name, fromDeclaration) {
        this.name = name || '';
        this.fromDeclaration = fromDeclaration;
        this.geometry = {
            vertices: [],
            normals: [],
            colors: [],
            uvs: [],
        };
        this.materials = [];
        this.smooth = true;
    }
    ObjObject.prototype.startMaterial = function (name, libraries) {
        var previous = this.finalize(false);
        // New usemtl declaration overwrites an inherited material, except if faces were declared
        // after the material, then it must be preserved for proper MultiMaterial continuation.
        if (previous && (previous.inherited || previous.groupCount <= 0)) {
            this.materials.splice(previous.index, 1);
        }
        var material = new MockMaterial(this.materials.length, name || '', (Array.isArray(libraries) && libraries.length > 0 ? libraries[libraries.length - 1] : ''), (previous !== undefined ? previous.smooth : this.smooth), (previous !== undefined ? previous.groupEnd : 0), -1, -1, false);
        this.materials.push(material);
        return material;
    };
    ObjObject.prototype.currentMaterial = function () {
        if (this.materials.length > 0) {
            return this.materials[this.materials.length - 1];
        }
        return undefined;
    };
    ObjObject.prototype.finalize = function (end) {
        var lastMultiMaterial = this.currentMaterial();
        if (lastMultiMaterial && lastMultiMaterial.groupEnd === -1) {
            lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
            lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
            lastMultiMaterial.inherited = false;
        }
        // Ignore objects tail materials if no face declarations followed them before a new o/g started.
        if (end && this.materials.length > 1) {
            for (var mi = this.materials.length - 1; mi >= 0; mi--) {
                if (this.materials[mi].groupCount <= 0) {
                    this.materials.splice(mi, 1);
                }
            }
        }
        // Guarantee at least one empty material, this makes the creation later more straight forward.
        if (end && this.materials.length === 0) {
            this.materials.push(createEmptyMaterial('', this.smooth));
        }
        return lastMultiMaterial;
    };
    return ObjObject;
}());
var ParserState = /** @class */ (function () {
    function ParserState() {
        this.objects = [];
        this.vertices = [];
        this.normals = [];
        this.colors = [];
        this.uvs = [];
        this.materialLibraries = [];
        this.startObject('', false);
    }
    ParserState.prototype.startObject = function (name, fromDeclaration) {
        // If the current object (initial from reset) is not from a g/o declaration in the parsed
        // file. We need to use it for the first parsed g/o to keep things in sync.
        if (this.object && this.object.fromDeclaration === false) {
            this.object.name = name;
            this.object.fromDeclaration = (fromDeclaration !== false);
            return;
        }
        var previousMaterial = (this.object &&
            typeof this.object.currentMaterial === 'function') ? this.object.currentMaterial() : undefined;
        if (this.object) {
            this.object.finalize(true);
        }
        this.object = new ObjObject(name, fromDeclaration !== false);
        // Inherit previous objects material.
        // Spec tells us that a declared material must be set to all objects until a new material is declared.
        // If a usemtl declaration is encountered while this new object is being parsed, it will
        // overwrite the inherited material. Exception being that there was already face declarations
        // to the inherited material, then it will be preserved for proper MultiMaterial continuation.
        if (previousMaterial && previousMaterial.name) {
            var declared = previousMaterial.clone(0);
            declared.inherited = true;
            this.object.materials.push(declared);
        }
        this.objects.push(this.object);
    };
    ParserState.prototype.finalize = function () {
        if (this.object) {
            this.object.finalize(true);
        }
    };
    ParserState.prototype.parseVertexIndex = function (value, len) {
        var index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 3) * 3;
    };
    ParserState.prototype.parseNormalIndex = function (value, len) {
        var index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 3) * 3;
    };
    ParserState.prototype.parseUVIndex = function (value, len) {
        var index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 2) * 2;
    };
    ParserState.prototype.addVertex = function (a, b, c) {
        var src = this.vertices;
        var dst = this.object.geometry.vertices;
        dst.push(src[a + 0], src[a + 1], src[a + 2]);
        dst.push(src[b + 0], src[b + 1], src[b + 2]);
        dst.push(src[c + 0], src[c + 1], src[c + 2]);
    };
    ParserState.prototype.addVertexPoint = function (a) {
        var src = this.vertices;
        var dst = this.object.geometry.vertices;
        dst.push(src[a + 0], src[a + 1], src[a + 2]);
    };
    ParserState.prototype.addVertexLine = function (a) {
        var src = this.vertices;
        var dst = this.object.geometry.vertices;
        dst.push(src[a + 0], src[a + 1], src[a + 2]);
    };
    ParserState.prototype.addNormal = function (a, b, c) {
        var src = this.normals;
        var dst = this.object.geometry.normals;
        dst.push(src[a + 0], src[a + 1], src[a + 2]);
        dst.push(src[b + 0], src[b + 1], src[b + 2]);
        dst.push(src[c + 0], src[c + 1], src[c + 2]);
    };
    ParserState.prototype.addColor = function (a, b, c) {
        var src = this.colors;
        var dst = this.object.geometry.colors;
        dst.push(src[a + 0], src[a + 1], src[a + 2]);
        dst.push(src[b + 0], src[b + 1], src[b + 2]);
        dst.push(src[c + 0], src[c + 1], src[c + 2]);
    };
    ParserState.prototype.addUV = function (a, b, c) {
        var src = this.uvs;
        var dst = this.object.geometry.uvs;
        dst.push(src[a + 0], src[a + 1]);
        dst.push(src[b + 0], src[b + 1]);
        dst.push(src[c + 0], src[c + 1]);
    };
    ParserState.prototype.addUVLine = function (a) {
        var src = this.uvs;
        var dst = this.object.geometry.uvs;
        dst.push(src[a + 0], src[a + 1]);
    };
    ParserState.prototype.addFace = function (a, b, c, ua, ub, uc, na, nb, nc) {
        var vLen = this.vertices.length;
        var ia = this.parseVertexIndex(a, vLen);
        var ib = this.parseVertexIndex(b, vLen);
        var ic = this.parseVertexIndex(c, vLen);
        this.addVertex(ia, ib, ic);
        if (ua !== undefined && ua !== '') {
            var uvLen = this.uvs.length;
            ia = this.parseUVIndex(ua, uvLen);
            ib = this.parseUVIndex(ub, uvLen);
            ic = this.parseUVIndex(uc, uvLen);
            this.addUV(ia, ib, ic);
        }
        if (na !== undefined && na !== '') {
            // Normals are many times the same. If so, skip function call and parseInt.
            var nLen = this.normals.length;
            ia = this.parseNormalIndex(na, nLen);
            ib = na === nb ? ia : this.parseNormalIndex(nb, nLen);
            ic = na === nc ? ia : this.parseNormalIndex(nc, nLen);
            this.addNormal(ia, ib, ic);
        }
        if (this.colors.length > 0) {
            this.addColor(ia, ib, ic);
        }
    };
    ParserState.prototype.addPointGeometry = function (vertices) {
        this.object.geometry.type = 'Points';
        var vLen = this.vertices.length;
        for (var vi = 0, l = vertices.length; vi < l; vi++) {
            this.addVertexPoint(this.parseVertexIndex(vertices[vi], vLen));
        }
    };
    ParserState.prototype.addLineGeometry = function (vertices, uvs) {
        this.object.geometry.type = 'Line';
        var vLen = this.vertices.length;
        var uvLen = this.uvs.length;
        for (var vi = 0, l = vertices.length; vi < l; vi++) {
            this.addVertexLine(this.parseVertexIndex(vertices[vi], vLen));
        }
        for (var uvi = 0, l = uvs.length; uvi < l; uvi++) {
            this.addUVLine(this.parseUVIndex(uvs[uvi], uvLen));
        }
    };
    return ParserState;
}());
var OBJLoader = /** @class */ (function () {
    function OBJLoader(manager) {
        this.manager = manager;
        this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
        this.materials = null;
    }
    OBJLoader.prototype.load = function (url, onLoad, onProgress, onError) {
        var _this = this;
        var loader = new THREE.FileLoader(this.manager);
        loader.setPath(this.path);
        loader.load(url, function (text) {
            if (typeof text !== 'string') {
                throw new Error('Unable to parse arrayBuffer!');
            }
            onLoad(_this.parse(text));
        }, onProgress, onError);
    };
    OBJLoader.prototype.setPath = function (value) {
        this.path = value;
        return this;
    };
    OBJLoader.prototype.setMaterials = function (materials) {
        this.materials = materials;
        return this;
    };
    OBJLoader.prototype.parse = function (text) {
        // tslint:disable-next-line: no-console
        console.time('OBJLoader');
        var state = new ParserState();
        if (text.indexOf('\r\n') !== -1) {
            // This is faster than string.split with regex that splits on both
            text = text.replace(/\r\n/g, '\n');
        }
        if (text.indexOf('\\\n') !== -1) {
            // join lines separated by a line continuation character (\)
            text = text.replace(/\\\n/g, '');
        }
        var lines = text.split('\n');
        var line = '', lineFirstChar = '';
        var lineLength = 0;
        var result = [];
        // Faster to just trim left side of the line. Use if available.
        var trimLeft = ((typeof '').trimLeft === 'function');
        for (var i = 0, l = lines.length; i < l; i++) {
            line = lines[i];
            line = trimLeft ? line.trimLeft() : line.trim();
            lineLength = line.length;
            if (lineLength === 0) {
                continue;
            }
            lineFirstChar = line.charAt(0);
            // @todo invoke passed in handler if any
            if (lineFirstChar === '#') {
                continue;
            }
            if (lineFirstChar === 'v') {
                var data = line.split(/\s+/);
                switch (data[0]) {
                    case 'v':
                        state.vertices.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
                        if (data.length === 8) {
                            state.colors.push(parseFloat(data[4]), parseFloat(data[5]), parseFloat(data[6]));
                        }
                        break;
                    case 'vn':
                        state.normals.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
                        break;
                    case 'vt':
                        state.uvs.push(parseFloat(data[1]), parseFloat(data[2]));
                        break;
                }
            }
            else if (lineFirstChar === 'f') {
                var lineData = line.substr(1).trim();
                var vertexData = lineData.split(/\s+/);
                var faceVertices = [];
                // Parse the face vertex data into an easy to work with format
                for (var j = 0, jl = vertexData.length; j < jl; j++) {
                    var vertex = vertexData[j];
                    if (vertex.length > 0) {
                        var vertexParts = vertex.split('/');
                        faceVertices.push(vertexParts);
                    }
                }
                // Draw an edge between the first vertex and all subsequent vertices to form an n-gon
                var v1 = faceVertices[0];
                for (var j = 1, jl = faceVertices.length - 1; j < jl; j++) {
                    var v2 = faceVertices[j];
                    var v3 = faceVertices[j + 1];
                    state.addFace(v1[0], v2[0], v3[0], v1[1], v2[1], v3[1], v1[2], v2[2], v3[2]);
                }
            }
            else if (lineFirstChar === 'l') {
                var lineParts = line.substring(1).trim().split(' ');
                var lineUVs = [];
                var lineVertices = [];
                if (line.indexOf('/') === -1) {
                    lineVertices = lineParts;
                }
                else {
                    for (var li = 0, lLen = lineParts.length; li < lLen; li++) {
                        var parts = lineParts[li].split('/');
                        if (parts[0] !== '') {
                            lineVertices.push(parts[0]);
                        }
                        if (parts[1] !== '') {
                            lineUVs.push(parts[1]);
                        }
                    }
                }
                state.addLineGeometry(lineVertices, lineUVs);
            }
            else if (lineFirstChar === 'p') {
                var lineData = line.substr(1).trim();
                var pointData = lineData.split(' ');
                state.addPointGeometry(pointData);
            }
            else {
                result = OBJECT_PATTERN.exec(line);
                if (result !== null) {
                    // o object_name
                    // or
                    // g group_name
                    // WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
                    // const name = result[0].substr(1).trim();
                    var name_1 = (' ' + result[0].substr(1).trim()).substr(1);
                    state.startObject(name_1);
                }
                else if (MATERIAL_USE_PATTERN.test(line)) {
                    // material
                    state.object.startMaterial(line.substring(7).trim(), state.materialLibraries);
                }
                else if (MATERIAL_LIBRARY_PATTERN.test(line)) {
                    // mtl file
                    state.materialLibraries.push(line.substring(7).trim());
                }
                else if (lineFirstChar === 's') {
                    result = line.split(' ');
                    // smooth shading
                    // @todo Handle files that have const typing smooth values for a set of faces inside one geometry,
                    // but does not define a usemtl for each face set.
                    // This should be detected and a dummy material created (later MultiMaterial and geometry groups).
                    // This requires some care to not create extra material on each smooth value for 'normal' obj files.
                    // where explicit usemtl defines geometry groups.
                    // Example asset: examples/models/obj/cerberus/Cerberus.obj
                    /*
                        * http://paulbourke.net/dataformats/obj/
                        * or
                        * http://www.cs.utah.edu/~boulos/cs3505/obj_spec.pdf
                        *
                        * From chapter 'Grouping' Syntax explanation 's group_number':
                        * 'group_number is the smoothing group number. To turn off smoothing groups,
                        * use a value of 0 or off.
                        * Polygonal elements use group numbers to put elements in different
                        * smoothing groups. For free-form
                        * surfaces, smoothing groups are either turned on or off; there is no
                        * difference between values greater
                        * than 0.'
                        */
                    if (result.length > 1) {
                        var value = result[1].trim().toLowerCase();
                        state.object.smooth = (value !== '0' && value !== 'off');
                    }
                    else {
                        // ZBrush can produce 's' lines #11707
                        state.object.smooth = true;
                    }
                    var material = state.object.currentMaterial();
                    if (material) {
                        material.smooth = state.object.smooth;
                    }
                }
                else {
                    // Handle null terminated files without exception
                    if (line === '\0') {
                        continue;
                    }
                    throw new Error("THREE.OBJLoader: Unexpected line: \"" + line + "\".");
                }
            }
        }
        state.finalize();
        var container = new THREE.Group();
        container.materialLibraries = [].concat(state.materialLibraries);
        for (var i = 0, l = state.objects.length; i < l; i++) {
            var object = state.objects[i];
            var geometry = object.geometry;
            var materials = object.materials;
            var isLine = (geometry.type === 'Line');
            var isPoints = (geometry.type === 'Points');
            var hasVertexColors = false;
            // Skip o/g line declarations that did not follow with any faces
            if (geometry.vertices.length === 0) {
                continue;
            }
            var bufferGeometry = new THREE.BufferGeometry();
            bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(geometry.vertices, 3));
            if (geometry.normals.length > 0) {
                bufferGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(geometry.normals, 3));
            }
            else {
                bufferGeometry.computeVertexNormals();
            }
            if (geometry.colors.length > 0) {
                hasVertexColors = true;
                bufferGeometry.setAttribute('color', new THREE.Float32BufferAttribute(geometry.colors, 3));
            }
            if (geometry.uvs.length > 0) {
                bufferGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(geometry.uvs, 2));
            }
            // Create materials
            var createdMaterials = [];
            for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {
                var sourceMaterial = materials[mi];
                var material = void 0;
                if (this.materials !== null) {
                    material = this.materials.create(sourceMaterial.name);
                    // mtl etc. loaders probably can't create line
                    // materials correctly, copy properties to a line material.
                    if (isLine && material && !(material instanceof THREE.LineBasicMaterial)) {
                        var materialLine = new THREE.LineBasicMaterial();
                        THREE.Material.prototype.copy.call(materialLine, material);
                        materialLine.color.copy(material.color);
                        materialLine.lights = false;
                        material = materialLine;
                    }
                    else if (isPoints && material && !(material instanceof THREE.PointsMaterial)) {
                        var materialPoints = new THREE.PointsMaterial({ size: 10, sizeAttenuation: false });
                        THREE.Material.prototype.copy.call(materialPoints, material);
                        materialPoints.color.copy(material.color);
                        materialPoints.map = material.map;
                        materialPoints.lights = false;
                        material = materialPoints;
                    }
                }
                if (!material) {
                    if (isLine) {
                        material = new THREE.LineBasicMaterial();
                    }
                    else if (isPoints) {
                        material = new THREE.PointsMaterial({ size: 1, sizeAttenuation: false });
                    }
                    else {
                        material = new THREE.MeshPhongMaterial();
                    }
                    material.name = sourceMaterial.name;
                }
                material.flatShading = sourceMaterial.smooth ? false : true;
                material.vertexColors = hasVertexColors ? THREE.VertexColors : THREE.NoColors;
                createdMaterials.push(material);
            }
            // Create mesh
            var mesh = void 0;
            if (createdMaterials.length > 1) {
                for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {
                    var sourceMaterial = materials[mi];
                    bufferGeometry.addGroup(sourceMaterial.groupStart, sourceMaterial.groupCount, mi);
                }
                if (isLine) {
                    mesh = new THREE.LineSegments(bufferGeometry, createdMaterials);
                }
                else if (isPoints) {
                    mesh = new THREE.Points(bufferGeometry, createdMaterials);
                }
                else {
                    mesh = new THREE.Mesh(bufferGeometry, createdMaterials);
                }
            }
            else {
                if (isLine) {
                    mesh = new THREE.LineSegments(bufferGeometry, createdMaterials[0]);
                }
                else if (isPoints) {
                    mesh = new THREE.Points(bufferGeometry, createdMaterials[0]);
                }
                else {
                    mesh = new THREE.Mesh(bufferGeometry, createdMaterials[0]);
                }
            }
            mesh.name = object.name;
            container.add(mesh);
        }
        // tslint:disable-next-line: no-console
        console.timeEnd('OBJLoader');
        return container;
    };
    return OBJLoader;
}());
exports.OBJLoader = OBJLoader;
