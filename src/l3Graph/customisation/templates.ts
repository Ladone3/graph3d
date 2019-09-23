import * as React from 'react';
import * as _THREE from 'three';
import { L3Mesh } from './mesh';

export interface ReactOverlay<ReactProps = any> {
    id: string;
    value: React.ReactElement<ReactProps>;
    context?: any;
}

export interface NodeViewTemplate<Content = any> {
    overlay?: ReactOverlay<Content>;
    mesh?: () => L3Mesh;
}

export interface LinkViewTemplate {
    color: number | string;
    thickness?: number;
    overlay?: ReactOverlay<{label: string}>;
}

export type NodeTemplateProvider<Content = any> = (data: Content) => NodeViewTemplate;
export type LinkTemplateProvider<Content = any> = (data: Content) => LinkViewTemplate;
