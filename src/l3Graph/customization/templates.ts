import * as React from 'react';
import * as _THREE from 'three';
import { L3Mesh } from './mesh';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
import { Link } from '../models/graph/link';
import { Node } from '../models/graph/node';

export interface OverlayProps<Model> {
    target?: Model;
}

export type NodeOverlayProps<Descriptor extends GraphDescriptor> = OverlayProps<Node<Descriptor>>;
export type LinkOverlayProps<Descriptor extends GraphDescriptor> = OverlayProps<Link<Descriptor>>;

export interface ReactOverlay<Model> {
    id: string;
    value: React.ReactElement<OverlayProps<Model>>;
    context?: any;
}

export interface ViewTemplate<Model> {
    overlay?: ReactOverlay<Model>;
    mesh?: () => L3Mesh;
}

export interface LinkViewTemplate<Descriptor extends GraphDescriptor> {
    color: number | string;
    thickness?: number;
    overlay?: ReactOverlay<Link<Descriptor>>;
}

export type ProviderTemplateType<Model, Descriptor extends GraphDescriptor = GraphDescriptor> =
    Model extends Link<Descriptor> ? LinkViewTemplate<Descriptor> : ViewTemplate<Model>;
export type TemplateProvider<Model, Descriptor extends GraphDescriptor = GraphDescriptor> =
    (model: Model) => ProviderTemplateType<Model, Descriptor>;
