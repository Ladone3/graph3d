export interface DefaultNodeContent {
    label: string;
}

export interface DefaultLinkContent {
    label: string;
}

export interface GraphDescriptor<NodeContent = unknown, LinkContent = unknown> {
    nodeContentType: NodeContent;
    linkContentType: LinkContent;
}

export interface DefaultDescriptor {
    nodeContentType: DefaultNodeContent;
    linkContentType: DefaultLinkContent;
}
