import {Scenario} from "./scenario.service";
import {CodeMap} from "../data/model/CodeMap";
import {STATISTIC_OPS} from "../statistic/statistic.service";

export function createDefaultScenario(map: CodeMap): Scenario {

    return {
        name: "ncloc/mcc/mcc(20,40)",
        settings: {
            map: map,
            neutralColorRange: {
                from: 20,
                to: 40,
                flipped: false
            },
            areaMetric: "ncloc",
            heightMetric: "mcc",
            colorMetric: "mcc",
            deltas: false,
            amountOfTopLabels: 1,
            scaling: {
                x: 1, y: 1, z: 1
            },
            camera: {
                x: 0, y: 300, z: 1000
            },
            margin: 1,
            operation: STATISTIC_OPS.NOTHING,
            deltaColorFlipped: false
        }
    };

};