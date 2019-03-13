Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var GamepadTester = (function () {
    function GamepadTester(props) {
        this.boundingBox = new THREE.Box3();
        this.mesh = new THREE.Group();
        this.mesh.add(props.mesh);
        this.model = null;
        this.update();
    }
    GamepadTester.prototype.getBoundingBox = function () {
        return this.boundingBox;
    };
    GamepadTester.prototype.update = function () {
        this.mesh.position.set(0, 0, 0);
    };
    return GamepadTester;
}());
exports.GamepadTester = GamepadTester;
