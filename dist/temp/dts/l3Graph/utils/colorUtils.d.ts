export declare function rgbToHex(r: number, g: number, b: number): string;
/**
 * https://gist.github.com/eyecatchup/9536706
 */
export declare function HSVtoRGB(h: number, s: number, v: number): {
    r: number;
    g: number;
    b: number;
};
/**
 * Calculate a 32 bit FNV-1a hash
 * https://gist.github.com/vaiorabbit/5657561
 */
export declare function hashFnv32a(str: string, seed?: number): number;
