import { AmbientLight, DirectionalLight, Group, Material, Scene, Vector3 } from "three"
import { CodeMapMesh } from "../rendering/codeMapMesh"
import { CodeMapBuilding } from "../rendering/codeMapBuilding"
import { CcState, CodeMapNode, LayoutAlgorithm, Node } from "../../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { ColorConverter } from "../../../util/color/colorConverter"
import { FloorLabelDrawer } from "./floorLabels/floorLabelDrawer"
import { setSelectedBuildingId } from "../../../state/store/appStatus/selectedBuildingId/selectedBuildingId.actions"
import { idToNodeSelector } from "../../../state/selectors/accumulatedData/idToNode.selector"
import { IdToBuildingService } from "../../../services/idToBuilding/idToBuilding.service"
import { mapColorsSelector } from "../../../state/store/appSettings/mapColors/mapColors.selector"
import { ThreeRendererService } from "./threeRenderer.service"
import { Injectable, OnDestroy } from "@angular/core"
import { treeMapSize } from "../../../util/algorithm/treeMapLayout/treeMapHelper"
import { EventEmitter } from "../../../util/EventEmitter"
import { State, Store } from "@ngrx/store"
import { FileExtensionCalculator, NO_EXTENSION } from "../../fileExtensionBar/selectors/fileExtensionCalculator"

type BuildingSelectedEvents = {
    onBuildingSelected: (data: { building: CodeMapBuilding }) => void
    onBuildingDeselected: () => void
}

@Injectable({ providedIn: "root" })
export class ThreeSceneService implements OnDestroy {
    scene: Scene
    labels: Group
    floorLabelPlanes: Group
    edgeArrows: Group
    mapGeometry: Group

    private readonly lights: Group
    private mapMesh: CodeMapMesh
    private eventEmitter = new EventEmitter<BuildingSelectedEvents>()

    private floorLabelDrawer: FloorLabelDrawer

    private selected: CodeMapBuilding = null
    private highlightedBuildingIds: Set<number> = new Set()
    private highlightedNodeIds: Set<number> = new Set()
    private primaryHighlightedBuilding: CodeMapBuilding = null
    private constantHighlight: Map<number, CodeMapBuilding> = new Map()

    // Hardcoded color values — no runtime theming system (CSS custom properties) exists in this project.
    // These do not adapt to dark mode or theme changes.
    private readonly folderLabelColorHighlighted = ColorConverter.convertHexToNumber("#FFFFFF")
    private readonly folderLabelColorNotHighlighted = ColorConverter.convertHexToNumber("#7A7777")
    private folderLabelColorSelected: string
    private numberSelectionColor: number

    private subscription = this.store.select(mapColorsSelector).subscribe(mapColors => {
        this.folderLabelColorSelected = mapColors.selected
        this.numberSelectionColor = ColorConverter.convertHexToNumber(this.folderLabelColorSelected)
    })

    constructor(
        private store: Store<CcState>,
        private state: State<CcState>,
        private idToBuilding: IdToBuildingService,
        private threeRendererService: ThreeRendererService
    ) {
        this.scene = new Scene()
        this.mapGeometry = new Group()
        this.lights = new Group()
        this.labels = new Group()
        this.floorLabelPlanes = new Group()
        this.edgeArrows = new Group()

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

    private initFloorLabels(nodes: Node[]) {
        for (const child of this.floorLabelPlanes.children) {
            const childWithGeometry = child as unknown as { geometry?: { dispose: () => void } }
            if (childWithGeometry.geometry) {
                childWithGeometry.geometry.dispose()
            }
            const childWithMaterial = child as unknown as {
                material?: { map?: { dispose: () => void }; dispose: () => void }
            }
            if (childWithMaterial.material) {
                childWithMaterial.material.map?.dispose()
                childWithMaterial.material.dispose()
            }
        }
        this.floorLabelPlanes.clear()

        const { layoutAlgorithm, enableFloorLabels } = this.state.getValue().appSettings
        if (layoutAlgorithm !== LayoutAlgorithm.SquarifiedTreeMap || !enableFloorLabels) {
            return
        }

        const rootNode = this.getRootNode(nodes)
        if (!rootNode) {
            return
        }
        const scaling = this.state.getValue().appSettings.scaling
        const experimentalFeaturesEnabled = this.state.getValue().appSettings.experimentalFeaturesEnabled
        const scalingVector = new Vector3(scaling.x, scaling.y, scaling.z)

        this.floorLabelDrawer = new FloorLabelDrawer(
            this.mapMesh.getNodes(),
            rootNode,
            treeMapSize,
            scalingVector,
            experimentalFeaturesEnabled
        )
        const floorLabels = this.floorLabelDrawer.draw()

        if (floorLabels.length > 0) {
            this.floorLabelPlanes.add(...floorLabels)
            this.scene.add(this.floorLabelPlanes)
        }
    }

    private getRootNode(nodes: Node[]) {
        return nodes.find(node => node.id === 0)
    }

    getConstantHighlight() {
        return this.constantHighlight
    }

    private getMapMaterials(): Material[] | null {
        const child = this.mapGeometry.children[0]
        if (!child) {
            return null
        }
        const mat = (child as unknown as { material: unknown }).material
        return Array.isArray(mat) ? (mat as Material[]) : null
    }

    applyHighlights() {
        const state = this.state.getValue() as CcState
        this.getMapMesh().highlightBuilding(
            this.highlightedBuildingIds,
            this.primaryHighlightedBuilding,
            this.selected,
            state,
            this.constantHighlight
        )
        const materials = this.getMapMaterials()
        if (materials) {
            const constantHighlightedNodes = new Set<number>([...this.constantHighlight.values()].map(({ node }) => node.id))
            this.highlightMaterial(materials, constantHighlightedNodes)
        }
        this.threeRendererService.render()
    }

    applyClearHighlights() {
        this.clearHighlight()
        this.threeRendererService.render()
    }

    private selectMaterial(materials: Material[]) {
        const selectedMaterial = materials.find(({ userData }) => userData.id === this.selected.node.id)
        selectedMaterial?.["color"].setHex(this.numberSelectionColor)
    }

    private resetMaterial(materials: Material[]) {
        const selectedID = this.selected ? this.selected.node.id : -1
        for (const material of materials) {
            const materialNodeId = material.userData.id
            if (materialNodeId !== selectedID) {
                material["color"]?.setHex(this.folderLabelColorHighlighted)
            }
        }
    }

    scaleHeight() {
        const scale = this.state.getValue().appSettings.scaling

        this.floorLabelDrawer?.translatePlaneCanvases(scale)
        this.mapGeometry.scale.set(scale.x, scale.y, scale.z)
        this.mapGeometry.position.set(-treeMapSize * scale.x, 0, -treeMapSize * scale.z)
        this.mapMesh.setScale(scale)
    }

    private highlightMaterial(materials: Material[], constantHighlightedNodes: Set<number>) {
        for (const material of materials) {
            const materialNodeId = material.userData.id
            if (this.selected && materialNodeId === this.selected.node.id) {
                material["color"].setHex(this.numberSelectionColor)
            } else if (this.highlightedNodeIds.has(materialNodeId) || constantHighlightedNodes.has(materialNodeId)) {
                material["color"].setHex(this.folderLabelColorHighlighted)
            } else {
                material["color"]?.setHex(this.folderLabelColorNotHighlighted)
            }
        }
    }

    highlightSingleBuilding(building: CodeMapBuilding) {
        this.highlightedBuildingIds.clear()
        this.highlightedNodeIds.clear()
        this.primaryHighlightedBuilding = null
        this.addBuildingsToHighlightingList(building)
        this.applyHighlights()
    }

    addBuildingsToHighlightingList(...buildings: CodeMapBuilding[]) {
        for (const building of buildings) {
            if (this.primaryHighlightedBuilding === null) {
                this.primaryHighlightedBuilding = building
            }
            this.highlightedBuildingIds.add(building.id)
            this.highlightedNodeIds.add(building.node.id)
        }
    }

    clearHoverHighlight() {
        this.highlightedBuildingIds.clear()
        this.highlightedNodeIds.clear()
        this.primaryHighlightedBuilding = null
        this.applyHighlights()
    }

    prepareHighlightTransition() {
        this.highlightedBuildingIds.clear()
        this.highlightedNodeIds.clear()
        this.primaryHighlightedBuilding = null
    }

    clearHighlight() {
        if (this.getMapMesh()) {
            this.getMapMesh().clearUnselectedBuildings(this.selected)
            this.highlightedBuildingIds.clear()
            this.highlightedNodeIds.clear()
            this.primaryHighlightedBuilding = null
            this.constantHighlight.clear()
            const materials = this.getMapMaterials()
            if (materials) {
                this.resetMaterial(materials)
            }
        }
    }

    selectBuilding(building: CodeMapBuilding) {
        if (!building) {
            return
        }
        // TODO: This check shouldn't be necessary. When investing into model we should investigate why and remove the need.
        if (building.id !== this.selected?.id) {
            this.store.dispatch(setSelectedBuildingId({ value: building.node.id }))
        }

        this.getMapMesh().selectBuilding(building, this.folderLabelColorSelected)
        this.selected = building
        this.applyHighlights()

        this.eventEmitter.emit("onBuildingSelected", { building: this.selected })
        const materials = this.getMapMaterials()
        if (materials) {
            this.selectMaterial(materials)
        }
    }

    addNodeAndChildrenToConstantHighlight(codeMapNode: Pick<CodeMapNode, "id">) {
        const idToNode = idToNodeSelector(this.state.getValue())
        const codeMapBuilding = idToNode.get(codeMapNode.id)
        for (const { data } of hierarchy(codeMapBuilding)) {
            const building = this.idToBuilding.get(data.id)
            if (building) {
                this.constantHighlight.set(building.id, building)
            }
        }
    }

    removeNodeAndChildrenFromConstantHighlight(codeMapNode: Pick<CodeMapNode, "id">) {
        const idToNode = idToNodeSelector(this.state.getValue())
        const codeMapBuilding = idToNode.get(codeMapNode.id)
        for (const { data } of hierarchy(codeMapBuilding)) {
            const building = this.idToBuilding.get(data.id)
            if (building) {
                this.constantHighlight.delete(building.id)
            }
        }
    }

    clearConstantHighlight() {
        if (this.constantHighlight.size > 0) {
            this.clearHighlight()
        }
    }

    clearSelection() {
        if (this.selected) {
            this.getMapMesh().clearSelection(this.selected)
            this.store.dispatch(setSelectedBuildingId({ value: null }))
            this.eventEmitter.emit("onBuildingDeselected")
        }

        if (this.highlightedBuildingIds.size > 0) {
            this.applyHighlights()
        }
        this.selected = null
        const materials = this.getMapMaterials()
        if (materials) {
            this.resetMaterial(materials)
        }
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
        this.mapMesh = mesh

        this.initFloorLabels(nodes)

        // Reset children
        this.mapGeometry.children.length = 0

        this.mapGeometry.position.x = -treeMapSize
        this.mapGeometry.position.y = 0
        this.mapGeometry.position.z = -treeMapSize

        this.mapGeometry.add(this.mapMesh.getThreeMesh())

        this.idToBuilding.setIdToBuilding(this.mapMesh.getMeshDescription().buildings)
    }

    getMapMesh() {
        return this.mapMesh
    }

    getSelectedBuilding() {
        return this.selected
    }

    getHighlightedBuilding() {
        return this.primaryHighlightedBuilding
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
        const shouldExtensionBeHighlighted = (buildingExtension: string) => buildingExtension === NO_EXTENSION
        this.applyHighlightingForExtensions(shouldExtensionBeHighlighted)
    }

    highlightBuildingsByExtension(extensionsToHighlight: Set<string>) {
        const shouldExtensionBeHighlighted = (buildingExtension: string) => extensionsToHighlight.has(buildingExtension)
        this.applyHighlightingForExtensions(shouldExtensionBeHighlighted)
    }

    private applyHighlightingForExtensions(shouldExtensionBeHighlighted: (buildingExtension: string) => boolean) {
        const buildingsToHighlight = this.mapMesh.getMeshDescription().buildings.filter(building => {
            if (!building.node.isLeaf) {
                return false
            }

            const buildingExtension = FileExtensionCalculator.estimateFileExtension(building.node.name)
            return shouldExtensionBeHighlighted(buildingExtension)
        })

        this.addBuildingsToHighlightingList(...buildingsToHighlight)
        this.applyHighlights()
    }
}
