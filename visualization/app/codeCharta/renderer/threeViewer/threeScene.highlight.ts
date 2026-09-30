import { FileExtensionCalculator } from "../../util/fileExtension/fileExtensionCalculator"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import { CodeMapMesh } from "./rendering/codeMapMesh"
import { ThreeSceneStore } from "./stores/threeScene.store"
import { ThreeRendererService } from "./threeRenderer.service"
import { ThreeSceneMaterials } from "./threeScene.materials"

interface HighlightedScene {
    getMapMesh: () => CodeMapMesh
    getSelectedBuilding: () => CodeMapBuilding | null
}

export class ThreeSceneHighlight {
    private readonly highlightedBuildingIds: Set<number> = new Set()
    private readonly highlightedNodeIds: Set<number> = new Set()
    private primaryHighlightedBuilding: CodeMapBuilding = null
    private readonly constantHighlight: Map<number, CodeMapBuilding> = new Map()

    constructor(
        private readonly scene: HighlightedScene,
        private readonly threeSceneStore: ThreeSceneStore,
        private readonly threeRendererService: ThreeRendererService,
        private readonly materials: ThreeSceneMaterials
    ) {}

    getConstantHighlight() {
        return this.constantHighlight
    }

    getPrimaryHighlightedBuilding() {
        return this.primaryHighlightedBuilding
    }

    hasHoverHighlight() {
        return this.highlightedBuildingIds.size > 0
    }

    apply() {
        const selected = this.scene.getSelectedBuilding()
        this.scene
            .getMapMesh()
            .highlightBuilding(
                this.highlightedBuildingIds,
                this.primaryHighlightedBuilding,
                selected,
                this.threeSceneStore.getState(),
                this.constantHighlight
            )
        this.materials.highlight(selected, this.highlightedNodeIds, this.constantHighlight)
        this.threeRendererService.render()
    }

    applyClear() {
        if (this.constantHighlight.size > 0) {
            this.clearHover()
            return
        }
        this.clear()
        this.threeRendererService.render()
    }

    highlightSingle(building: CodeMapBuilding) {
        this.prepareTransition()
        this.add(building)
        this.apply()
    }

    add(...buildings: CodeMapBuilding[]) {
        for (const building of buildings) {
            this.primaryHighlightedBuilding ??= building
            this.highlightedBuildingIds.add(building.id)
            this.highlightedNodeIds.add(building.node.id)
        }
    }

    clearHover() {
        this.prepareTransition()
        this.apply()
    }

    prepareTransition() {
        this.highlightedBuildingIds.clear()
        this.highlightedNodeIds.clear()
        this.primaryHighlightedBuilding = null
    }

    clear() {
        const mapMesh = this.scene.getMapMesh()
        if (!mapMesh) {
            return
        }
        const selected = this.scene.getSelectedBuilding()
        mapMesh.clearUnselectedBuildings(selected)
        this.prepareTransition()
        this.constantHighlight.clear()
        this.materials.reset(selected)
    }

    showKept(paths: readonly string[]) {
        if (!this.scene.getMapMesh()) {
            return
        }
        const hadKeptHighlight = this.constantHighlight.size > 0
        this.collectKept(paths)
        if (this.constantHighlight.size > 0) {
            this.paintKept()
        } else if (hadKeptHighlight) {
            this.repaintWithoutKept()
        }
    }

    restoreKept() {
        this.collectKept(this.threeSceneStore.getKeptHighlightPaths())
        if (this.constantHighlight.size > 0) {
            this.paintKept()
        }
    }

    highlightMatchingExtensions(shouldExtensionBeHighlighted: (buildingExtension: string) => boolean) {
        const mapMesh = this.scene.getMapMesh()
        if (!mapMesh) {
            return
        }
        const buildingsToHighlight = mapMesh
            .getMeshDescription()
            .buildings.filter(
                building =>
                    building.node.isLeaf && shouldExtensionBeHighlighted(FileExtensionCalculator.estimateFileExtension(building.node.name))
            )
        this.add(...buildingsToHighlight)
        this.apply()
    }

    private paintKept() {
        this.scene.getMapMesh().clearUnselectedBuildings(this.scene.getSelectedBuilding())
        this.apply()
    }

    private repaintWithoutKept() {
        const selected = this.scene.getSelectedBuilding()
        this.scene.getMapMesh().clearUnselectedBuildings(selected)
        if (this.hasHoverHighlight()) {
            this.apply()
            return
        }
        this.materials.reset(selected)
        this.threeRendererService.render()
    }

    private collectKept(paths: readonly string[]) {
        this.constantHighlight.clear()
        for (const path of paths) {
            const building = this.scene.getMapMesh().getBuildingByPath(path)
            if (building) {
                this.constantHighlight.set(building.id, building)
            }
        }
    }
}
