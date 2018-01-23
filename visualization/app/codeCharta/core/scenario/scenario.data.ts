import {Scenario} from "./scenario.service";
import {CodeMap} from "../data/model/CodeMap";
import {STATISTIC_OPS} from "../statistic/statistic.service";

export function createDefaultScenario(map: CodeMap): Scenario {

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
            deltas: false,
            amountOfTopLabels: 1,
            scaling: {
                x: 1, y: 1, z: 1
            },
            camera: {
                x: 1806, y: 1024, z: 948
            },
            margin: 1,
            operation: STATISTIC_OPS.NOTHING
        }
    };

};