import {Scenario} from "./scenario.service";
import {CodeMap} from "../data/model/CodeMap";
import {KindOfMap} from "../settings/settings.service";

export function createDefaultScenario(): Scenario {

    return {
        name: "rloc/mcc/mcc(20,40)",
        settings: {
            neutralColorRange: {
                from: 20,
                to: 40,
                flipped: false
            },
            areaMetric: "rloc",
            heightMetric: "mcc",
            colorMetric: "mcc"
        },
        autoFitCamera: true
    };

}