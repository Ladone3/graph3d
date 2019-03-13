"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var graphModel_1 = require("./graphModel");
var subscribeable_1 = require("../utils/subscribeable");
var widgetsModel_1 = require("./widgetsModel");
var selection_1 = require("./selection");
var DiagramModel = /** @class */ (function (_super) {
    tslib_1.__extends(DiagramModel, _super);
    function DiagramModel() {
        var _this = _super.call(this) || this;
        _this.deprecatedSelection = new Set();
        _this.graphEvents = new Set();
        _this.widgetEvents = new Set();
        _this.performSyncUpdate = function () {
            cancelAnimationFrame(_this.animationFrame);
            _this.animationFrame = requestAnimationFrame(function () {
                var events = {
                    graphEvents: _this.graphEvents,
                    widgetEvents: _this.widgetEvents,
                    deprecatedSelection: _this.deprecatedSelection,
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
        _this.widgets = new widgetsModel_1.WidgetsModel();
        _this.initSelectionWidget();
        _this.graph.on('add:elements', _this.groupGraphEvents);
        _this.graph.on('remove:elements', _this.groupGraphEvents);
        _this.graph.on('update:element', _this.groupGraphEvents);
        _this.widgets.on('add:widget', _this.groupWidgetEvents);
        _this.widgets.on('remove:widget', _this.groupWidgetEvents);
        _this.widgets.on('update:widget', _this.groupWidgetEvents);
        return _this;
    }
    Object.defineProperty(DiagramModel.prototype, "selection", {
        get: function () {
            return this._selection.selection;
        },
        set: function (newSelection) {
            var oldSelection = this._selection.selection;
            this._selection.selection = newSelection;
            this.trigger('change:selection', oldSelection);
        },
        enumerable: true,
        configurable: true
    });
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
    DiagramModel.prototype.addElements = function (elements) {
        this.graph.addElements(elements);
    };
    DiagramModel.prototype.removeElements = function (elements) {
        this.graph.removeElements(elements);
    };
    DiagramModel.prototype.removeNodesByIds = function (nodeIds) {
        this.graph.removeNodesByIds(nodeIds);
    };
    DiagramModel.prototype.removeLinksByIds = function (linkIds) {
        this.graph.removeLinksByIds(linkIds);
    };
    DiagramModel.prototype.updateElements = function (elements) {
        this.graph.updateElementsData(elements);
    };
    DiagramModel.prototype.initSelectionWidget = function () {
        this._selection = new selection_1.Selection();
        this.widgets.registerWidget(this._selection);
    };
    return DiagramModel;
}(subscribeable_1.Subscribable));
exports.DiagramModel = DiagramModel;
