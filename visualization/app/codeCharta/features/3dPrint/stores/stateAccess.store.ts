import { Injectable } from "@angular/core"
import { State } from "@ngrx/store"
import { AttributeDescriptors, BlacklistItem, CcState, ColorRange } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"
import { accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"

@Injectable({ providedIn: "root" })
export class Print3DStateAccessStore {
    constructor(private readonly state: State<CcState>) {}

    getAreaMetric(): string {
        return this.state.getValue().mapState.areaMetric
    }

    getHeightMetric(): string {
        return this.state.getValue().mapState.heightMetric
    }

    getColorMetric(): string {
        return this.state.getValue().mapState.colorMetric
    }

    getColorRange(): ColorRange {
        return this.state.getValue().mapState.colorRange
    }

    getAttributeDescriptors(): AttributeDescriptors {
        return this.state.getValue().metricsLensSource.attributeDescriptors
    }

    getBlacklist(): BlacklistItem[] {
        return this.state.getValue().sharedView.blacklist
    }

    getFiles(): FileState[] {
        return this.state.getValue().files
    }

    getAccumulatedFileName(): string | undefined {
        return accumulatedDataSelector(this.state.getValue()).unifiedFileMeta?.fileName
    }
}
