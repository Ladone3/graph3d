declare module "dom-to-image" {
    function toPng (
        htmlElement: HTMLElement,
        parameters?: {
            quality?: number,
            width?: number,
            height?: number,
        }
    ): Promise<string>;
}
