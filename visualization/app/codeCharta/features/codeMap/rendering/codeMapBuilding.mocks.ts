import { Box3 } from "three"
import { DEFAULT_STATE, INCOMING_NODE, OUTGOING_NODE, TEST_NODE_LEAF, TEST_NODE_ROOT } from "../../../util/dataMocks"
import { CodeMapBuilding } from "./codeMapBuilding"

export const CODE_MAP_BUILDING: CodeMapBuilding = new CodeMapBuilding(
    0,
    new Box3(),
    TEST_NODE_ROOT,
    DEFAULT_STATE.appSettings.mapColors.neutral
)

export const CODE_MAP_BUILDING_TS_NODE: CodeMapBuilding = new CodeMapBuilding(
    1,
    new Box3(),
    TEST_NODE_LEAF,
    DEFAULT_STATE.appSettings.mapColors.neutral
)

export const CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE: CodeMapBuilding = new CodeMapBuilding(
    1,
    new Box3(),
    OUTGOING_NODE,
    DEFAULT_STATE.appSettings.mapColors.neutral
)

export const CODE_MAP_BUILDING_WITH_INCOMING_EDGE_NODE: CodeMapBuilding = new CodeMapBuilding(
    2,
    new Box3(),
    INCOMING_NODE,
    DEFAULT_STATE.appSettings.mapColors.neutral
)

export const CONSTANT_HIGHLIGHT: Map<number, CodeMapBuilding> = new Map([
    [CODE_MAP_BUILDING.id, CODE_MAP_BUILDING],
    [CODE_MAP_BUILDING_TS_NODE.id, CODE_MAP_BUILDING_TS_NODE]
])
