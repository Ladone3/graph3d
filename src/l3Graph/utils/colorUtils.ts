export function rgbToHex(r: number, g: number, b: number): string {
    let rH = Number(r).toString(16);
    if (rH.length < 2) {
        rH = '0' + rH;
    }
    let gH = Number(g).toString(16);
    if (gH.length < 2) {
        gH = '0' + gH;
    }
    let bH = Number(b).toString(16);
    if (bH.length < 2) {
        bH = '0' + bH;
    }
    return `#${rH}${gH}${bH}`;
}

/**
 * https://gist.github.com/eyecatchup/9536706
 */
export function HSVtoRGB(h: number, s: number, v: number) {
    let r, g, b;
    let i;
    let f, p, q, t;

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
            r = v; g = t; b = p;
            break;
        case 1:
            r = q;  g = v; b = p;
            break;
        case 2:
            r = p; g = v;  b = t;
            break;
        case 3:
            r = p; g = q; b = v;
            break;
        case 4:
            r = t; g = p; b = v;
            break;
        default: // case 5:
            r = v; g = p; b = q;
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}

/**
 * Calculate a 32 bit FNV-1a hash
 * https://gist.github.com/vaiorabbit/5657561
 */
export function hashFnv32a(str: string, seed = 0x811c9dc5): number {
    /* tslint:disable:no-bitwise */
    let i: number, l: number, hval = seed & 0x7fffffff;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return hval >>> 0;
    /* tslint:enable:no-bitwise */
}
