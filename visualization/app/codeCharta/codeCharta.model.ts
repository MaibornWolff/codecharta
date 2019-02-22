export interface CCFile {
  map: CodeMapNode;
  settings: {
      fileSettings: RecursivePartial<Settings>
  };
  fileMeta: FileMeta;
}

export interface CodeMapNode {
    name: string;
    type: string;
    children?: CodeMapNode[];
    attributes: {
        [key: string]: number
    };
    deltas?: {
        [key: string]: number
    };
    link?: string;
    origin?: string;
    visible?: boolean;
    path?: string;
    markingColor?: string;
}

export interface FileMeta {
  fileName: string;
  apiVersion: string;
  projectName: string;
}

export interface Settings {
    fileSettings: FileSettings;
    dynamicSettings: DynamicSettings;
    appSettings: AppSettings;
}

export interface FileSettings {
    attributeTypes: AttributeTypes;
    blacklist: Array<BlacklistItem>;
    edges: Edge[];
    markedPackages: MarkedPackages[];
}

export interface DynamicSettings {
    renderMode: RenderMode; // TODO remove from settings ?
    areaMetric: string;
    heightMetric: string;
    colorMetric: string;
    focusedNodePath: string;
    searchedNodePaths: Array<string>;
    searchPattern: string;
    margin: number;
    neutralColorRange: ColorRange;
}

export interface AppSettings {
    amountOfTopLabels: number;
    scaling: Vector3d;
    camera: Vector3d;
    deltaColorFlipped: boolean;
    enableEdgeArrows: boolean;
    hideFlatBuildings: boolean;
    maximizeDetailPanel: boolean;
    invertHeight: boolean;
    dynamicMargin: boolean;
    isWhiteBackground: boolean;
    mapColors: MapColors;
    whiteColorBuildings: boolean;
}

export interface MapColors {
    positive: string;
    neutral: string;
    negative: string;
    selected: string;
    defaultC: string;
    positiveDelta: string;
    negativeDelta: string;
    base: string;
    flat: string;
    lightGrey: string;
    angularGreen: string;
    markingColors: string[];
}

export interface ColorRange {
    from: number;
    to: number;
    flipped: boolean;
}

export interface Vector3d {
    x: number;
    y: number;
    z: number;
}

export interface AttributeTypes {
    nodes?: {
        [key: string]: AttributeType
    };
    edges?: {
        [key: string]: AttributeType
    };
}

export enum AttributeType {
    absolute, relative
}


export interface Edge {
    fromNodeName: string;
    toNodeName: string;
    attributes: {
        [key: string]: number
    };
    visible?: boolean;
}

export interface BlacklistItem {
    path: string;
    type: BlacklistType;
}

export enum BlacklistType {
    hide = "hide",
    exclude = "exclude"
}

export interface MarkedPackages {
    path: string,
    color: string,
    attributes: {
        [key: string]: any
    }
}

export enum RenderMode {
  Single = "Single",
  Multiple = "Multiple",
  Delta = "Delta",
}

export interface MetricData {
    name: string;
    maxValue: number;
}

export interface Scenario {
    name: string;
    settings: RecursivePartial<Settings>;
}

export interface UrlData {
    filenames: string[];
    settings: Partial<Settings>;
}

export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};
