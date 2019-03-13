Object.defineProperty(exports, "__esModule", { value: true });
var Subscribable = (function () {
    function Subscribable() {
        this._subscriptions = {};
        this._subscriptionsOnAny = [];
    }
    Subscribable.prototype.on = function (eventId, callback) {
        if (!this._subscriptions[eventId]) {
            this._subscriptions[eventId] = [];
        }
        this._subscriptions[eventId].push(callback);
    };
    Subscribable.prototype.onAny = function (callback) {
        this._subscriptionsOnAny.push(callback);
    };
    Subscribable.prototype.unsubscribe = function (eventId, callback) {
        if (this._subscriptions[eventId]) {
            var subscribers = this._subscriptions[eventId];
            var index = subscribers.indexOf(callback);
            if (index !== -1) {
                subscribers.splice(index, 1);
                return;
            }
        }
    };
    Subscribable.prototype.unsubscribeFromAll = function (callback) {
        for (var subscriptionKey in this._subscriptions) {
            if (this._subscriptions[subscriptionKey]) {
                var subscribers = this._subscriptions[subscriptionKey];
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
        if (this._subscriptions[eventId]) {
            this._subscriptions[eventId].forEach(function (c) {
                c.call(_this, {
                    eventId: eventId,
                    target: _this,
                    data: eventObject,
                });
            });
        }
        if (this._subscriptionsOnAny) {
            this._subscriptionsOnAny.forEach(function (c) {
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
