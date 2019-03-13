"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var selectionWidget_1 = require("./models/widgets/selectionWidget");
var selectionView_1 = require("./views/widgets/selectionView");
var arrowHelperView_1 = require("./views/widgets/arrowHelperView");
var arrowHelper_1 = require("./models/widgets/arrowHelper");
var gamepadsWidget_1 = require("./models/widgets/gamepadsWidget");
var gamepadsWidgetView_1 = require("./views/widgets/gamepadsWidgetView");
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
exports.gamepadWidgetFactory = {
    getModel: function (context) {
        return new gamepadsWidget_1.GamepadsWidget({ gamepadHandler: context.gamepadHandler });
    },
    getView: function (context) { return new gamepadsWidgetView_1.GamepadsWidgetView({
        model: context.widget,
        vrManager: context.vrManager,
    }); },
};
exports.DEFAULT_MESH_WIDGET_SET = [
    exports.selectionWidgetFactory,
    exports.arrowHelperWidgetFactory,
    exports.gamepadWidgetFactory,
];
