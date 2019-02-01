import {Scenario} from "./scenario.service";
import {CodeMap} from "../data/model/CodeMap";
import {KindOfMap} from "../settings/settings.service";

export function createDefaultScenario(map: CodeMap, margin: number): Scenario {

    return {
        name: "rloc/mcc/mcc(20,40)",
        settings: {
            map: map,
            neutralColorRange: {
                from: 20,
                to: 40,
                flipped: false
            },
            areaMetric: "rloc",
            heightMetric: "mcc",
            colorMetric: "mcc",
            mode: KindOfMap.Single,
            amountOfTopLabels: 1,
            scaling: {
                x: 1, y: 1, z: 1
            },
            camera: {
                x: 0, y: 300, z: 1000
            },
            margin: margin,
            deltaColorFlipped: false,
            enableEdgeArrows: true,
            hideFlatBuildings: true,
            maximizeDetailPanel: false,
            invertHeight: false,
            dynamicMargin: true,
            isWhiteBackground: false,
            blacklist:[],
            searchPattern: ""
        },
        autoFitCamera: true
    };

}