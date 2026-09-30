import { EventEmitter } from "../../util/EventEmitter"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import { CodeMapMesh } from "./rendering/codeMapMesh"
import { ThreeSceneStore } from "./stores/threeScene.store"
import { ThreeSceneHighlight } from "./threeScene.highlight"
import { ThreeSceneMaterials } from "./threeScene.materials"

export type BuildingSelectedEvents = {
    onBuildingSelected: (data: { building: CodeMapBuilding }) => void
    onBuildingDeselected: () => void
}

interface SelectionPainters {
    highlight: ThreeSceneHighlight
    materials: ThreeSceneMaterials
}

export class ThreeSceneSelection {
    private selected: CodeMapBuilding = null
    private selectionColor: string

    constructor(
        private readonly getMapMesh: () => CodeMapMesh,
        private readonly threeSceneStore: ThreeSceneStore,
        private readonly painters: SelectionPainters,
        private readonly eventEmitter: EventEmitter<BuildingSelectedEvents>
    ) {}

    getSelected() {
        return this.selected
    }

    setSelectionColor(hexColor: string) {
        this.selectionColor = hexColor
        this.painters.materials.setSelectionColor(hexColor)
    }

    select(building: CodeMapBuilding) {
        if (!building) {
            return
        }
        const isNewSelection = building.id !== this.selected?.id
        this.paint(building)
        if (isNewSelection) {
            this.threeSceneStore.selectNode(building.node.path)
        }
    }

    show(path: string | null) {
        const mapMesh = this.getMapMesh()
        if (!mapMesh || (this.selected?.node.path ?? null) === path) {
            return
        }
        const building = path === null ? undefined : mapMesh.getBuildingByPath(path)
        if (building) {
            this.paint(building)
            return
        }
        if (this.selected) {
            this.paintNone()
            this.eventEmitter.emit("onBuildingDeselected")
        }
    }

    clear() {
        // A node picked in the explorer is selected whether or not the map drew a building for it — a
        // folder, or a file with no area in the current metric, has none. Clearing only what the scene
        // holds would leave such a selection in the store, and the inspector open on it for good.
        const hadSelection = this.selected !== null || this.threeSceneStore.getSelectedNodePath() !== null
        this.paintNone()
        if (hadSelection) {
            this.threeSceneStore.clearNodeSelection()
            this.eventEmitter.emit("onBuildingDeselected")
        }
    }

    // The store owns the selection: another view can change it while this mesh is not drawn.
    remapOntoMesh() {
        const previouslySelected = this.selected
        const selectedPath = this.threeSceneStore.getSelectedNodePath()
        const buildingOnNewMesh = selectedPath === null ? undefined : this.getMapMesh().getBuildingByPath(selectedPath)
        this.clearStaleSelectionColor(previouslySelected, selectedPath)
        this.selected = null
        if (buildingOnNewMesh) {
            this.paint(buildingOnNewMesh)
            return
        }
        if (previouslySelected?.node.path === selectedPath) {
            this.threeSceneStore.clearNodeSelection()
            this.eventEmitter.emit("onBuildingDeselected")
        }
    }

    repaintSelected() {
        if (this.selected) {
            this.getMapMesh().selectBuilding(this.selected, this.selectionColor)
        }
    }

    private paint(building: CodeMapBuilding) {
        const mapMesh = this.getMapMesh()
        if (this.selected && this.selected.id !== building.id) {
            mapMesh.clearSelection(this.selected)
        }
        mapMesh.selectBuilding(building, this.selectionColor)
        this.selected = building
        this.painters.highlight.apply()

        this.eventEmitter.emit("onBuildingSelected", { building: this.selected })
        this.painters.materials.paintSelected(this.selected)
    }

    private paintNone() {
        if (this.selected) {
            this.getMapMesh().clearSelection(this.selected)
        }
        // null before repainting: the highlight pass must not treat the
        // just-deselected building as still selected
        this.selected = null

        if (this.painters.highlight.hasHoverHighlight()) {
            this.painters.highlight.apply()
        }
        this.painters.materials.reset(null)
    }

    private clearStaleSelectionColor(previouslySelected: CodeMapBuilding | null, selectedPath: string | null) {
        const hasStaleSelection = previouslySelected !== null && previouslySelected.node.path !== selectedPath
        const buildingOnMesh = hasStaleSelection ? this.getMapMesh().getBuildingByPath(previouslySelected.node.path) : undefined
        if (buildingOnMesh) {
            this.getMapMesh().clearSelection(buildingOnMesh)
        }
    }
}
