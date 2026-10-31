import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { formatClusterShare } from "../../../../lenses/clusters/clusters.facade"
import { SidebarInspectorReadStore } from "../../stores/sidebarInspector.read.store"

@Component({
    selector: "cc-inspector-clusters",
    templateUrl: "./inspectorClusters.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InspectorClustersComponent {
    readonly sections = toSignal(inject(SidebarInspectorReadStore).clusterSections$, { requireSync: true })
    readonly formatShare = formatClusterShare
}
