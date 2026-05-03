import { Injectable } from "@angular/core"
import { State } from "@ngrx/store"
import { AttributeDescriptors, BlacklistItem, CcState, ColorRange } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"
import { accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"

@Injectable({ providedIn: "root" })
export class Print3DStateAccessStore {
    constructor(private readonly state: State<CcState>) {}

    getAreaMetric(): string {
        return this.state.getValue().dynamicSettings.areaMetric
    }

    getHeightMetric(): string {
        return this.state.getValue().dynamicSettings.heightMetric
    }

    getColorMetric(): string {
        return this.state.getValue().dynamicSettings.colorMetric
    }

    getColorRange(): ColorRange {
        return this.state.getValue().dynamicSettings.colorRange
    }

    getAttributeDescriptors(): AttributeDescriptors {
        return this.state.getValue().fileSettings.attributeDescriptors
    }

    getBlacklist(): BlacklistItem[] {
        return this.state.getValue().fileSettings.blacklist
    }

    getFiles(): FileState[] {
        return this.state.getValue().files
    }

    getAccumulatedFileName(): string | undefined {
        return accumulatedDataSelector(this.state.getValue()).unifiedFileMeta?.fileName
    }
}
