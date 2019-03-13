"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getColorByTypes(strings) {
    var hash;
    for (var _i = 0, strings_1 = strings; _i < strings_1.length; _i++) {
        var name_1 = strings_1[_i];
        hash = hashFnv32a(name_1, hash);
    }
    var MAX_INT32 = 0x7fffffff;
    var TON = 360 * ((hash === undefined ? 0 : hash) / MAX_INT32);
    var SATURATION = 40;
    var BRIGHTNESS = 75;
    var _a = HSVtoRGB(TON, SATURATION, BRIGHTNESS), r = _a.r, g = _a.g, b = _a.b;
    return rgbToHex(r, g, b);
}
exports.getColorByTypes = getColorByTypes;
function rgbToHex(r, g, b) {
    var rH = Number(r).toString(16);
    if (rH.length < 2) {
        rH = '0' + rH;
    }
    var gH = Number(g).toString(16);
    if (gH.length < 2) {
        gH = '0' + gH;
    }
    var bH = Number(b).toString(16);
    if (bH.length < 2) {
        bH = '0' + bH;
    }
    return "#" + rH + gH + bH;
}
exports.rgbToHex = rgbToHex;
/**
 * https://gist.github.com/eyecatchup/9536706
 */
function HSVtoRGB(h, s, v) {
    var r, g, b;
    var i;
    var f, p, q, t;
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
    s /= 100;
    v /= 100;
    if (s === 0) {
        // Achromatic (grey)
        r = g = b = v;
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
        };
    }
    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));
    switch (i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        default:// case 5:
            r = v;
            g = p;
            b = q;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}
exports.HSVtoRGB = HSVtoRGB;
/**
 * Calculate a 32 bit FNV-1a hash
 * https://gist.github.com/vaiorabbit/5657561
 */
function hashFnv32a(str, seed) {
    if (seed === void 0) { seed = 0x811c9dc5; }
    /* tslint:disable:no-bitwise */
    var i, l, hval = seed & 0x7fffffff;
    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return hval >>> 0;
    /* tslint:enable:no-bitwise */
}
exports.hashFnv32a = hashFnv32a;
