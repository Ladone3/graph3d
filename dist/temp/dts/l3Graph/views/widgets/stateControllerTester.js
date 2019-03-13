"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var editorTools_1 = require("./gamepadTools/editorTools");
var widget_1 = require("../../models/widgets/widget");
exports.SELECTION_PADDING = 5;
var StateTesterModel = /** @class */ (function (_super) {
    tslib_1.__extends(StateTesterModel, _super);
    function StateTesterModel(parameters) {
        var _this = _super.call(this) || this;
        _this.parameters = parameters;
        parameters.keyHandler.on('keyUp', function () {
            setTimeout(function () { return _this.forceUpdate(); }, 100);
        });
        return _this;
    }
    return StateTesterModel;
}(widget_1.Widget));
exports.StateTesterModel = StateTesterModel;
var StateTesterView = /** @class */ (function () {
    function StateTesterView(_a) {
        var model = _a.model;
        this.editorTool = new editorTools_1.LeftGamepadEditorTool({
            gamepadHandler: model.parameters.keyHandler,
            diagramModel: undefined,
            vrManager: undefined,
            stateCore: new editorTools_1.DefaultEditorStateCore('test-prefix'),
        });
        this.mesh = this.editorTool.mesh;
        this.mesh.scale.setScalar(100);
        this.update();
    }
    StateTesterView.prototype.getBoundingBox = function () {
        return undefined;
    };
    StateTesterView.prototype.update = function () {
        /* */
    };
    return StateTesterView;
}());
exports.StateTesterView = StateTesterView;
