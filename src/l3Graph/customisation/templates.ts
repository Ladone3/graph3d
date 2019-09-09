import * as React from 'react';
import * as _THREE from 'three';
import { L3Mesh } from './mesh';

export interface ReactOverlay<ReactProps = any> {
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

export type NodeTemplateProvider = (types: string[]) => NodeViewTemplate;
export type LinkTemplateProvider = (types: string[]) => LinkViewTemplate;
