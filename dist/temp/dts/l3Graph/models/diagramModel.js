"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var graphModel_1 = require("./graph/graphModel");
var subscribable_1 = require("../utils/subscribable");
var widgetsModel_1 = require("./widgets/widgetsModel");
var selection_1 = require("./widgets/selection");
var DiagramModel = /** @class */ (function (_super) {
    tslib_1.__extends(DiagramModel, _super);
    function DiagramModel() {
        var _this = _super.call(this) || this;
        _this.graphEvents = new Set();
        _this.widgetEvents = new Set();
        _this.performSyncUpdate = function () {
            cancelAnimationFrame(_this.animationFrame);
            _this.animationFrame = requestAnimationFrame(function () {
                var events = {
                    graphEvents: _this.graphEvents,
                    widgetEvents: _this.widgetEvents,
                };
                _this.graphEvents = new Set();
                _this.widgetEvents = new Set();
                _this.trigger('syncupdate', events);
            });
        };
        _this.groupGraphEvents = function (event) {
            _this.graphEvents.add(event);
            _this.performSyncUpdate();
        };
        _this.groupWidgetEvents = function (event) {
            _this.widgetEvents.add(event);
            _this.performSyncUpdate();
        };
        _this.graph = new graphModel_1.GraphModel();
        _this.widgetRegistry = new widgetsModel_1.WidgetsModel();
        _this.selection = new selection_1.Selection({ graph: _this.graph });
        _this.graph.on('add:elements', _this.groupGraphEvents);
        _this.graph.on('remove:elements', _this.groupGraphEvents);
        _this.graph.on('update:element', _this.groupGraphEvents);
        _this.widgetRegistry.on('add:widget', _this.groupWidgetEvents);
        _this.widgetRegistry.on('remove:widget', _this.groupWidgetEvents);
        _this.widgetRegistry.on('update:widget', _this.groupWidgetEvents);
        return _this;
    }
    Object.defineProperty(DiagramModel.prototype, "nodes", {
        get: function () {
            return this.graph.nodes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiagramModel.prototype, "links", {
        get: function () {
            return this.graph.links;
        },
        enumerable: true,
        configurable: true
    });
    return DiagramModel;
}(subscribable_1.Subscribable));
exports.DiagramModel = DiagramModel;
