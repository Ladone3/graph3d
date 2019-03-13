"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var selectionWidget_1 = require("./models/widgets/selectionWidget");
var selectionView_1 = require("./views/widgets/selectionView");
var arrowHelperView_1 = require("./views/widgets/arrowHelperView");
var arrowHelper_1 = require("./models/widgets/arrowHelper");
var gamepadsWidget_1 = require("./models/widgets/gamepadsWidget");
var gamepadsWidgetView_1 = require("./views/widgets/gamepadsWidgetView");
var elementCreationTools_1 = require("./views/widgets/gamepadTools/elementCreationTools");
var defaultTools_1 = require("./views/widgets/gamepadTools/defaultTools");
exports.selectionWidgetFactory = {
    getModel: function (context) { return new selectionWidget_1.SelectionWidget({
        diagramModel: context.diagramModel,
    }); },
    getView: function (context) { return new selectionView_1.SelectionView({
        model: context.widget,
    }); },
};
exports.arrowHelperWidgetFactory = {
    getModel: function (context) {
        return new arrowHelper_1.ArrowHelper({ mouseHandler: context.mouseHandler });
    },
    getView: function (context) { return new arrowHelperView_1.ArrowHelperView({
        model: context.widget,
    }); },
};
exports.gamepadsWidgetFactory = {
    getModel: function (context) {
        var gamepadHandler = context.gamepadHandler, diagramModel = context.diagramModel, vrManager = context.vrManager;
        return new gamepadsWidget_1.GamepadsWidget({
            gamepadHandler: context.gamepadHandler,
            leftTools: [
                new defaultTools_1.LeftGamepadTool({ gamepadHandler: gamepadHandler, vrManager: vrManager }),
            ],
            rightTools: [
                new defaultTools_1.RightGamepadTool({ gamepadHandler: gamepadHandler, vrManager: vrManager }),
            ],
        });
    },
    getView: function (context) { return new gamepadsWidgetView_1.GamepadsWidgetView({
        model: context.widget,
        vrManager: context.vrManager,
    }); },
};
exports.testToolFactory = {
    getModel: function (context) {
        var gamepadHandler = context.gamepadHandler, diagramModel = context.diagramModel, vrManager = context.vrManager;
        return {
            widgetId: 'testToolFactory',
            forceUpdate: function () { },
            model: new elementCreationTools_1.LeftCreationTool({
                gamepadHandler: gamepadHandler,
                diagramModel: diagramModel,
                vrManager: vrManager,
                nodeIdPrefix: 'Node-created-by-left-controller-',
            }),
            on: function () { },
            onAny: function () { },
            unsubscribe: function () { },
            unsubscribeFromAll: function () { },
            trigger: function () { },
        };
    },
    getView: function (context) {
        var model = context.widget.model;
        return {
            mesh: model.mesh,
            getBoundingBox: function () { return undefined; },
            update: function () { model.mesh.position.set(0, 0, 0); },
            model: context.widget,
        };
    },
};
exports.DEFAULT_MESH_WIDGET_SET = [
    exports.selectionWidgetFactory,
    exports.arrowHelperWidgetFactory,
    exports.gamepadsWidgetFactory,
];
