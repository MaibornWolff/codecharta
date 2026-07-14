import { Injectable } from "@angular/core"
import { AttributeDescriptors, BlacklistItem, ColorRange, NodeMetricData } from "../../../model/codeCharta.model"
import { FileState } from "../../../model/files/files"
import { accumulatedDataSelector, nodeMetricDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { FileStoreReadWindow } from "../../../stores/fileStore/fileStore.facade"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { MetricsLensSourceReadWindow } from "../../../stores/metricsLensSource/metricsLensSource.read.facade"
import { CcStateSnapshot } from "../../../stores/rootStore/ccState.snapshot"
import { SharedViewReadWindow } from "../../../stores/sharedView/sharedView.read.facade"

@Injectable({ providedIn: "root" })
export class Print3DStateAccessStore {
    constructor(
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly metricsLensSourceReadWindow: MetricsLensSourceReadWindow,
        private readonly sharedViewReadWindow: SharedViewReadWindow,
        private readonly fileStoreReadWindow: FileStoreReadWindow,
        private readonly ccStateSnapshot: CcStateSnapshot
    ) {}

    getAreaMetric(): string {
        return this.mapStateReadWindow.getAreaMetric()
    }

    getHeightMetric(): string {
        return this.mapStateReadWindow.getHeightMetric()
    }

    getColorMetric(): string {
        return this.mapStateReadWindow.getColorMetric()
    }

    getColorRange(): ColorRange {
        return this.mapStateReadWindow.getColorRange()
    }

    getAttributeDescriptors(): AttributeDescriptors {
        return this.metricsLensSourceReadWindow.getAttributeDescriptors()
    }

    getNodeMetricData(): NodeMetricData[] {
        return nodeMetricDataSelector(this.ccStateSnapshot.get())
    }

    getBlacklist(): BlacklistItem[] {
        return this.sharedViewReadWindow.getBlacklist()
    }

    getFiles(): FileState[] {
        return this.fileStoreReadWindow.getFiles()
    }

    getAccumulatedFileName(): string | undefined {
        return accumulatedDataSelector(this.ccStateSnapshot.get()).unifiedFileMeta?.fileName
    }
}
