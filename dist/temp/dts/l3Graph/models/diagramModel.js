"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var graphModel_1 = require("./graph/graphModel");
var subscribable_1 = require("../utils/subscribable");
var widgetsModel_1 = require("./widgets/widgetsModel");
var selection_1 = require("./widgets/selection");
var mapEvent = new Map();
mapEvent.set('add:nodes', 'add:node');
mapEvent.set('update:nodes', 'update:node');
mapEvent.set('remove:nodes', 'remove:node');
mapEvent.set('add:links', 'add:link');
mapEvent.set('update:links', 'update:link');
mapEvent.set('remove:links', 'remove:link');
var DiagramModel = /** @class */ (function (_super) {
    tslib_1.__extends(DiagramModel, _super);
    function DiagramModel() {
        var _this = _super.call(this) || this;
        _this.nodeEvents = new Map();
        _this.linkEvents = new Map();
        _this.widgetEvents = new Map();
        _this.performSyncUpdate = function () {
            cancelAnimationFrame(_this.animationFrame);
            _this.animationFrame = requestAnimationFrame(function () {
                var events = {
                    nodeEvents: Array.from(_this.nodeEvents.values()),
                    linkEvents: Array.from(_this.linkEvents.values()),
                    widgetEvents: Array.from(_this.widgetEvents.values()),
                };
                _this.nodeEvents = new Map();
                _this.linkEvents = new Map();
                _this.widgetEvents = new Map();
                _this.trigger('syncupdate', events);
            });
        };
        _this.onNodeEvent = function (event) {
            for (var _i = 0, _a = event.data; _i < _a.length; _i++) {
                var model = _a[_i];
                var oldEvent = _this.nodeEvents.get(model);
                var eventType = mapEvent.get(event.eventId);
                if (oldEvent) {
                    if (eventType === 'add:node' && oldEvent.type === 'remove:node') {
                        _this.nodeEvents.set(model, { type: 'update:node', target: model });
                    }
                    else if (eventType === 'remove:node') {
                        if (oldEvent.type === 'add:node') {
                            _this.nodeEvents.delete(model);
                        }
                        else {
                            _this.nodeEvents.set(model, { type: eventType, target: model });
                        }
                    }
                }
                else {
                    _this.nodeEvents.set(model, { type: eventType, target: model });
                }
            }
            _this.performSyncUpdate();
        };
        _this.onLinkEvent = function (event) {
            for (var _i = 0, _a = event.data; _i < _a.length; _i++) {
                var model = _a[_i];
                var oldEvent = _this.linkEvents.get(model);
                var eventType = mapEvent.get(event.eventId);
                if (oldEvent) {
                    if (eventType === 'add:link' && oldEvent.type === 'remove:link') {
                        _this.linkEvents.set(model, { type: 'update:link', target: model });
                    }
                    else if (eventType === 'remove:link') {
                        if (oldEvent.type === 'add:link') {
                            _this.linkEvents.delete(model);
                        }
                        else {
                            _this.linkEvents.set(model, { type: eventType, target: model });
                        }
                    }
                }
                else {
                    _this.linkEvents.set(model, { type: eventType, target: model });
                }
            }
            _this.performSyncUpdate();
        };
        _this.onWidgetEvent = function (event) {
            var oldEvent = _this.widgetEvents.get(event.data);
            var eventType = event.eventId;
            if (oldEvent) {
                if (eventType === 'add:widget' && oldEvent.type === 'remove:widget') {
                    _this.widgetEvents.set(event.data, { type: 'update:widget', target: event.data });
                }
                else if (eventType === 'remove:widget') {
                    if (oldEvent.type === 'add:widget') {
                        _this.widgetEvents.delete(event.data);
                    }
                    else {
                        _this.widgetEvents.set(event.data, { type: eventType, target: event.data });
                    }
                }
            }
            else {
                _this.widgetEvents.set(event.data, { type: eventType, target: event.data });
            }
            _this.performSyncUpdate();
        };
        _this.graph = new graphModel_1.GraphModel();
        _this.widgetRegistry = new widgetsModel_1.WidgetsModel();
        _this.selection = new selection_1.Selection({ graph: _this.graph });
        _this.graph.on('add:nodes', _this.onNodeEvent);
        _this.graph.on('remove:nodes', _this.onNodeEvent);
        _this.graph.on('update:nodes', _this.onNodeEvent);
        _this.graph.on('add:links', _this.onLinkEvent);
        _this.graph.on('remove:links', _this.onLinkEvent);
        _this.graph.on('update:links', _this.onLinkEvent);
        _this.widgetRegistry.on('add:widget', _this.onWidgetEvent);
        _this.widgetRegistry.on('remove:widget', _this.onWidgetEvent);
        _this.widgetRegistry.on('update:widget', _this.onWidgetEvent);
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
