import { Injectable, OnDestroy } from "@angular/core"
import { Subject } from "rxjs"
import { AmbientLight, DirectionalLight, Group, Scene } from "three"
import { CcState, Node } from "../../model/codeCharta.model"
import { isDeltaState } from "../../model/files/files.helper"
import { getMarkingColor } from "../../util/codeMapHelper"
import { EventEmitter } from "../../util/EventEmitter"
import { NO_EXTENSION } from "../../util/fileExtension/fileExtensionCalculator"
import { selectedColorMetricDataSelector } from "../renderModel/renderModel.facade"
import { getBuildingColor, treeMapSize } from "./algorithm/treeMapLayout/treeMapHelper"
import { IdToBuildingService } from "./idToBuilding.service"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import { CodeMapMesh } from "./rendering/codeMapMesh"
import { ThreeSceneStore } from "./stores/threeScene.store"
import { ThreeRendererService } from "./threeRenderer.service"
import { ThreeSceneFloorLabels } from "./threeScene.floorLabels"
import { ThreeSceneHighlight } from "./threeScene.highlight"
import { ThreeSceneMaterials } from "./threeScene.materials"
import { BuildingSelectedEvents, ThreeSceneSelection } from "./threeScene.selection"

@Injectable({ providedIn: "root" })
export class ThreeSceneService implements OnDestroy {
    scene = new Scene()
    labels = new Group()
    floorLabelPlanes = new Group()
    edgeArrows = new Group()
    mapGeometry = new Group()

    /** Emits right after a new map mesh has been placed into `mapGeometry` — the deterministic
     *  "the map is now in the scene" moment the camera auto-fit waits for. */
    readonly mapMeshChanged$ = new Subject<void>()

    private readonly lights = new Group()
    private mapMesh: CodeMapMesh
    private readonly eventEmitter = new EventEmitter<BuildingSelectedEvents>()

    private readonly floorLabels = new ThreeSceneFloorLabels(this.floorLabelPlanes, this.threeSceneStore, this.threeRendererService)
    private readonly materials = new ThreeSceneMaterials(this.mapGeometry)
    private readonly highlight = new ThreeSceneHighlight(
        { getMapMesh: () => this.mapMesh, getSelectedBuilding: () => this.selected },
        this.threeSceneStore,
        this.threeRendererService,
        this.materials
    )
    private readonly selection = new ThreeSceneSelection(
        () => this.mapMesh,
        this.threeSceneStore,
        { highlight: this.highlight, materials: this.materials },
        this.eventEmitter
    )

    private readonly subscription = this.threeSceneStore.mapColors$.subscribe(mapColors => {
        this.selection.setSelectionColor(mapColors.selected)
    })

    constructor(
        private readonly threeSceneStore: ThreeSceneStore,
        private readonly idToBuilding: IdToBuildingService,
        private readonly threeRendererService: ThreeRendererService
    ) {
        this.initLights()

        this.scene.add(this.mapGeometry)
        this.scene.add(this.edgeArrows)
        this.scene.add(this.labels)
        this.scene.add(this.lights)
        this.scene.add(this.floorLabelPlanes)
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe()
    }

    private get selected() {
        return this.selection.getSelected()
    }

    getConstantHighlight() {
        return this.highlight.getConstantHighlight()
    }

    applyHighlights() {
        this.highlight.apply()
    }

    applyClearHighlights() {
        this.highlight.applyClear()
    }

    scaleHeight() {
        const scale = this.threeSceneStore.getMapState().scaling

        this.floorLabels.translate(scale)
        this.mapGeometry.scale.set(scale.x, scale.y, scale.z)
        this.mapGeometry.position.set(-treeMapSize * scale.x, 0, -treeMapSize * scale.z)
        this.mapMesh.setScale(scale)
    }

    highlightSingleBuilding(building: CodeMapBuilding) {
        this.highlight.highlightSingle(building)
    }

    addBuildingsToHighlightingList(...buildings: CodeMapBuilding[]) {
        this.highlight.add(...buildings)
    }

    clearHoverHighlight() {
        this.highlight.clearHover()
    }

    prepareHighlightTransition() {
        this.highlight.prepareTransition()
    }

    clearHighlight() {
        this.highlight.clear()
    }

    selectBuilding(building: CodeMapBuilding) {
        this.selection.select(building)
    }

    /** Shows a selection another view made, without writing it back to the store. */
    showSelection(path: string | null) {
        this.selection.show(path)
    }

    /** Shows the highlight the store keeps, which another view can change while this mesh is not drawn. */
    showKeptHighlight(paths: readonly string[]) {
        this.highlight.showKept(paths)
    }

    clearSelection() {
        this.selection.clear()
    }

    initLights() {
        const ambilight = new AmbientLight(0x70_70_70) // soft white light
        const light1 = new DirectionalLight(0xe0_e0_e0, 1.5)
        light1.position.set(50, 10, 8).normalize()

        const light2 = new DirectionalLight(0xe0_e0_e0, 1.5)
        light2.position.set(-50, 10, -8).normalize()

        this.lights.add(ambilight)
        this.lights.add(light1)
        this.lights.add(light2)
    }

    setMapMesh(nodes: Node[], mesh: CodeMapMesh) {
        this.mapMesh?.dispose()
        this.mapMesh = mesh

        this.floorLabels.draw(nodes, this.mapMesh, this.scene)

        this.mapGeometry.children.length = 0

        this.mapGeometry.position.x = -treeMapSize
        this.mapGeometry.position.y = 0
        this.mapGeometry.position.z = -treeMapSize

        this.mapGeometry.add(this.mapMesh.getThreeMesh())

        this.syncMeshWithStore()
    }

    /** Move the buildings onto a new layout without replacing the mesh. Mirrors `setMapMesh` for the
     *  case where the node set did not change. */
    updateMapMeshInPlace(nodes: Node[], laidOutNodes: Node[], state: CcState, isDeltaState: boolean) {
        this.mapMesh.updateBuildings(laidOutNodes, state, isDeltaState)
        this.floorLabels.draw(nodes, this.mapMesh, this.scene)
        this.syncMeshWithStore()
    }

    private syncMeshWithStore() {
        this.idToBuilding.setIdToBuilding(this.mapMesh.getMeshDescription().buildings)
        this.selection.remapOntoMesh()
        this.highlight.restoreKept()
        this.mapMeshChanged$.next()
    }

    /** Recompute every building's colour and repaint it, without replacing the mesh. Selection and
     *  highlighting sit on top of the default colours, so both are re-applied once the defaults are
     *  back. */
    recolorMapMesh(state: CcState) {
        if (!this.mapMesh) {
            return
        }
        const colorMetricRange = selectedColorMetricDataSelector(state)
        const deltaState = isDeltaState(state.files)
        for (const node of this.mapMesh.getNodes()) {
            node.color = getBuildingColor(node, state, colorMetricRange, deltaState, node.flat)
            node.markingColor = getMarkingColor(node, state.sharedView.markedPackages)
        }
        this.mapMesh.recolorBuildings()
        this.selection.repaintSelected()
        this.highlight.apply()
    }

    getMapMesh() {
        return this.mapMesh
    }

    getSelectedBuilding() {
        return this.selected
    }

    getHighlightedBuilding() {
        return this.highlight.getPrimaryHighlightedBuilding()
    }

    dispose() {
        this.mapMesh?.dispose()
    }

    subscribe<Key extends keyof BuildingSelectedEvents>(key: Key, callback: BuildingSelectedEvents[Key]) {
        this.eventEmitter.on(key, (data?) => {
            callback(data)
        })
    }

    highlightBuildingsWithoutExtensions() {
        this.highlight.highlightMatchingExtensions(buildingExtension => buildingExtension === NO_EXTENSION)
    }

    highlightBuildingsByExtension(extensionsToHighlight: Set<string>) {
        this.highlight.highlightMatchingExtensions(buildingExtension => extensionsToHighlight.has(buildingExtension))
    }
}
