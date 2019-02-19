export interface CCFile {
  map: CodeMapNode;
  settings: {
      mapSettings: Partial<MapSettings>
  };
  fileMeta: FileMeta;
}

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export interface MetricData {
  name: string;
  maxValue: number;
}

export interface Scenario {
  name: string;
  settings: Partial<Settings>;
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

export interface UrlData {
  filenames: string[];
  settings: Partial<Settings>;
}

export interface FileMeta {
  fileName: string;
  apiVersion: string;
  projectName: string;
}

export interface Settings {
  mapSettings: MapSettings;
  appSettings: AppSettings;
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

export interface BlacklistItem {
    path: string;
    type: BlacklistType;
}

export enum BlacklistType {
    hide = "hide",
    exclude = "exclude"
}

export interface MapSettings {
  renderMode: RenderMode; // TODO remove from settings ? 

  areaMetric: string;
  heightMetric: string;
  colorMetric: string;

  focusedNodePath: string;
  searchedNodePaths: Array<string>;
  searchPattern: string;

  attributeTypes: AttributeTypes;
  blacklist: Array<BlacklistItem>;
  edges: Edge[];
}

export interface AppSettings {
  amountOfTopLabels: number;
  scaling: Vector3d;
  camera: Vector3d;
  margin: number;
  neutralColorRange: ColorRange;
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

export enum RenderMode {
  Single = "Single",
  Multiple = "Multiple",
  Delta = "Delta",
}
