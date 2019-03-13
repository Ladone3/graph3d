"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Subscribable = /** @class */ (function () {
    function Subscribable() {
        this._subscribtions = {};
        this._subscribtionsOnAny = [];
    }
    Subscribable.prototype.on = function (eventId, callback) {
        if (!this._subscribtions[eventId]) {
            this._subscribtions[eventId] = [];
        }
        this._subscribtions[eventId].push(callback);
    };
    Subscribable.prototype.onAny = function (callback) {
        this._subscribtionsOnAny.push(callback);
    };
    Subscribable.prototype.unsubscribe = function (callback) {
        for (var subscribtionKey in this._subscribtions) {
            if (this._subscribtions[subscribtionKey]) {
                var subscribers = this._subscribtions[subscribtionKey];
                var index = subscribers.indexOf(callback);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                    return;
                }
            }
        }
    };
    Subscribable.prototype.trigger = function (eventId, eventObject) {
        var _this = this;
        if (this._subscribtions[eventId]) {
            this._subscribtions[eventId].forEach(function (c) {
                c.call(_this, {
                    eventId: eventId,
                    target: _this,
                    data: eventObject,
                });
            });
        }
        if (this._subscribtionsOnAny) {
            this._subscribtionsOnAny.forEach(function (c) {
                c.call(_this, {
                    eventId: eventId,
                    target: _this,
                    data: eventObject,
                });
            });
        }
    };
    return Subscribable;
}());
exports.Subscribable = Subscribable;
exports.default = Subscribable;
