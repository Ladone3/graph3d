export interface DefaultNodeContent {
    label: string;
}
export interface DefaultLinkContent {
    label: string;
}
export interface GraphDescriptor<NodeContent = any, LinkContent = any> {
    nodeContentType: NodeContent;
    linkContentType: LinkContent;
}
