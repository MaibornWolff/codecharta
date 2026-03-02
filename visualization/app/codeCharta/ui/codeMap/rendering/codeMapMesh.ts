import { CodeMapShaderStrings } from "./shaders/loaders/codeMapShaderStrings"
import { GeometryGenerator } from "./geometryGenerator"
import { CodeMapGeometricDescription } from "./codeMapGeometricDescription"
import { CodeMapBuilding } from "./codeMapBuilding"
import { Node, Scaling, CcState } from "../../../codeCharta.model"
import {
    BufferAttribute,
    BufferGeometry,
    Camera,
    InstancedBufferAttribute,
    InstancedMesh,
    Matrix4,
    Mesh,
    Ray,
    ShaderMaterial,
    UniformsLib,
    UniformsUtils,
    Vector3
} from "three"
import { treeMapSize } from "../../../util/algorithm/treeMapLayout/treeMapHelper"
import {
    templatePositions,
    templateNormals,
    templateIsHeight,
    templateIndices,
    indicesPerNode,
    verticesPerBox
} from "./geometryGenerationHelper"

export interface MousePos {
    x: number
    y: number
}

type DirtyRange = { min: number; max: number }

interface InstancedAttributes {
    deltaAttr: InstancedBufferAttribute
    isLeafAttr: InstancedBufferAttribute
    templateUvs: BufferAttribute
}

interface ExportBuffers {
    positions: Float32Array
    normalsOut: Float32Array
    colors: Float32Array
    uvsOut: Float32Array
    isHeightOut: Float32Array
    deltasOut: Float32Array
    deltaColorsOut: Float32Array
    indices: Uint32Array
}

export class CodeMapMesh {
    static readonly NUM_OF_COLOR_VECTOR_FIELDS = 3
    static readonly HIGHLIGHT_LIGHTNESS_DELTA = -10
    static readonly PRESENTATION_LIGHTNESS_DELTA = 20

    private static readonly DISTANCE_LIGHTNESS_CONFIG: { distance: number; lightness: number }[] = [
        { distance: 800, lightness: 40 },
        { distance: 400, lightness: 30 },
        { distance: 250, lightness: 20 },
        { distance: 100, lightness: 15 },
        { distance: 50, lightness: 10 }
    ]

    private readonly threeMesh: InstancedMesh
    private material: ShaderMaterial
    private geomGen: GeometryGenerator
    private mapGeomDesc: CodeMapGeometricDescription
    private nodes: Node[]
    private heightScale = 1.0
    private dirtyRange: DirtyRange | null = null
    private _prevHighlightedIds: Set<number> | null = null
    private _prevIsPresentationMode: boolean | null = null

    constructor(nodes: Node[], state: CcState, isDeltaState: boolean) {
        this.initMaterial()

        this.geomGen = new GeometryGenerator()
        this.material.precision = "lowp" // no need for high precision in our shaders
        const buildResult = this.geomGen.build(nodes, this.material, state, isDeltaState)

        this.threeMesh = buildResult.mesh
        this.mapGeomDesc = buildResult.desc
        this.nodes = nodes

        this.initDeltaColorsOnMesh(state)
    }

    getThreeMesh(): InstancedMesh {
        return this.threeMesh
    }

    getNodes() {
        return this.nodes
    }

    selectBuilding(building: CodeMapBuilding, color: string) {
        building.setColor(color)
        building.setDeltaColor(color)
        this.setInstanceColor(building.id, building.getColorVector(), building.getDeltaColorVector())
        this.updateVertices()
    }

    clearSelection(selected: CodeMapBuilding) {
        selected.resetColor()
        this.setInstanceColor(selected.id, selected.getDefaultColorVector(), selected.getDefaultDeltaColorVector())
        this.updateVertices()
    }

    getMeshDescription() {
        return this.mapGeomDesc
    }

    getBuildingByPath(path: string) {
        return this.mapGeomDesc.getBuildingByPath(path)
    }

    checkMouseRayMeshIntersection(mouse: MousePos, camera: Camera) {
        const ray = this.calculatePickingRay(mouse, camera)
        return this.getMeshDescription().intersect(ray)
    }

    setScale(scale: Scaling) {
        this.mapGeomDesc.setScales(scale)
    }

    highlightBuilding(
        highlightedBuildingIds: Set<number>,
        primaryBuilding: CodeMapBuilding,
        selected: CodeMapBuilding,
        state: CcState,
        constantHighlight: Map<number, CodeMapBuilding>
    ) {
        const { isPresentationMode } = state.appSettings

        // force full re-render when presentation mode is toggled mid-hover
        if (this._prevIsPresentationMode !== null && this._prevIsPresentationMode !== isPresentationMode) {
            this._prevHighlightedIds = null
        }

        const prev = this._prevHighlightedIds

        if (prev && !isPresentationMode) {
            this.updateDimmedBuildings(prev, highlightedBuildingIds, constantHighlight, selected)
            this.updateHighlightedBuildings(prev, highlightedBuildingIds, selected)
        } else {
            this.updateAllBuildings(highlightedBuildingIds, constantHighlight, selected, isPresentationMode, primaryBuilding, state)
        }

        this._prevHighlightedIds = new Set(highlightedBuildingIds)
        this._prevIsPresentationMode = isPresentationMode
        this.updateVertices()
    }

    clearUnselectedBuildings(selected: CodeMapBuilding) {
        this._prevHighlightedIds = null
        this._prevIsPresentationMode = null
        for (const currentBuilding of this.mapGeomDesc.buildings) {
            if (this.isBuildingSelected(selected, currentBuilding)) {
                continue
            }
            this.setInstanceColor(currentBuilding.id, currentBuilding.getDefaultColorVector(), currentBuilding.getDefaultDeltaColorVector())
        }
        this.updateVertices()
    }

    toExportMesh(): Mesh {
        const instanceCount = this.threeMesh.count
        const attrs = this.extractInstancedAttributes()
        const buffers = this.allocateExportBuffers(instanceCount)

        const matrix = new Matrix4()
        const vertex = new Vector3()
        const normal = new Vector3()

        for (let i = 0; i < instanceCount; i++) {
            this.threeMesh.getMatrixAt(i, matrix)
            this.transformVertices(i, matrix, vertex, normal, attrs, buffers)
            this.fillIndexBuffer(i, buffers.indices)
        }

        return this.assembleExportGeometry(buffers)
    }

    private adjustSurroundingBuildingColors(primaryBuilding: CodeMapBuilding, building: CodeMapBuilding) {
        const distance = primaryBuilding.getCenterPoint(treeMapSize).distanceTo(building.getCenterPoint(treeMapSize))
        this.decreaseLightnessByDistance(building, distance)
    }

    private initDeltaColorsOnMesh(state: CcState) {
        if (this.mapGeomDesc.buildings[0]?.node.deltas) {
            for (const building of this.mapGeomDesc.buildings) {
                this.setNewDeltaColor(building, state)
                this.setInstanceColor(building.id, building.getColorVector(), building.getDeltaColorVector())
            }
            this.updateVertices()
        }
    }

    private setNewDeltaColor(building: CodeMapBuilding, state: CcState) {
        const {
            appSettings: { mapColors },
            dynamicSettings: { heightMetric }
        } = state
        const { node } = building

        if (node.flat) {
            building.setInitialDeltaColor(mapColors.flat)
            return
        }

        if (!node.deltas) {
            return
        }

        const deltaValue = node.deltas[heightMetric]
        if (deltaValue > 0) {
            building.setInitialDeltaColor(mapColors.positiveDelta)
        }
        if (deltaValue < 0) {
            building.setInitialDeltaColor(mapColors.negativeDelta)
        }
    }

    private isBuildingSelected(selected: CodeMapBuilding, building: CodeMapBuilding) {
        return selected && building.equals(selected)
    }

    private updateDimmedBuildings(
        prev: Set<number>,
        highlightedBuildingIds: Set<number>,
        constantHighlight: Map<number, CodeMapBuilding>,
        selected: CodeMapBuilding
    ) {
        for (const id of prev) {
            if (highlightedBuildingIds.has(id) || constantHighlight.has(id)) {
                continue
            }
            const building = this.mapGeomDesc.buildings[id]
            if (!building || this.isBuildingSelected(selected, building)) {
                continue
            }
            this.setInstanceColor(building.id, building.getDimmedColorVector(), building.getDimmedDeltaColorVector())
        }
    }

    private updateHighlightedBuildings(prev: Set<number>, highlightedBuildingIds: Set<number>, selected: CodeMapBuilding) {
        for (const id of highlightedBuildingIds) {
            if (prev.has(id)) {
                continue
            }
            const building = this.mapGeomDesc.buildings[id]
            if (!building || this.isBuildingSelected(selected, building)) {
                continue
            }
            this.setInstanceColor(building.id, building.getHighlightedColorVector(), building.getHighlightedDeltaColorVector())
        }
    }

    private updateAllBuildings(
        highlightedBuildingIds: Set<number>,
        constantHighlight: Map<number, CodeMapBuilding>,
        selected: CodeMapBuilding,
        isPresentationMode: boolean,
        primaryBuilding: CodeMapBuilding,
        state: CcState
    ) {
        for (const building of this.mapGeomDesc.buildings) {
            if (this.isBuildingSelected(selected, building)) {
                continue
            }
            if (highlightedBuildingIds.has(building.id) || constantHighlight.has(building.id)) {
                this.setInstanceColor(building.id, building.getHighlightedColorVector(), building.getHighlightedDeltaColorVector())
            } else if (isPresentationMode && primaryBuilding) {
                this.adjustSurroundingBuildingColors(primaryBuilding, building)
                this.setInstanceColor(building.id, building.getColorVector(), building.getDeltaColorVector())
            } else {
                this.setInstanceColor(building.id, building.getDimmedColorVector(), building.getDimmedDeltaColorVector())
            }
        }
    }

    private decreaseLightnessByDistance(building: CodeMapBuilding, distance: number) {
        for (const { distance: threshold, lightness } of CodeMapMesh.DISTANCE_LIGHTNESS_CONFIG) {
            if (distance > threshold) {
                building.decreaseLightness(lightness)
                return
            }
        }
    }

    private setInstanceColor(id: number, newColorVector: Vector3, newDeltaColorVector: Vector3) {
        const colorAttribute = this.threeMesh.geometry.getAttribute("color") as InstancedBufferAttribute
        const deltaAttribute = this.threeMesh.geometry.getAttribute("deltaColor") as InstancedBufferAttribute

        colorAttribute.setXYZ(id, newColorVector.x, newColorVector.y, newColorVector.z)
        deltaAttribute.setXYZ(id, newDeltaColorVector.x, newDeltaColorVector.y, newDeltaColorVector.z)

        if (this.dirtyRange === null) {
            this.dirtyRange = { min: id, max: id + 1 }
        } else {
            this.dirtyRange.min = Math.min(this.dirtyRange.min, id)
            this.dirtyRange.max = Math.max(this.dirtyRange.max, id + 1)
        }
    }

    private updateVertices() {
        const colorAttribute = this.threeMesh.geometry.getAttribute("color") as InstancedBufferAttribute
        const deltaAttribute = this.threeMesh.geometry.getAttribute("deltaColor") as InstancedBufferAttribute

        if (this.dirtyRange !== null) {
            const startElement = this.dirtyRange.min * CodeMapMesh.NUM_OF_COLOR_VECTOR_FIELDS
            const countElements = (this.dirtyRange.max - this.dirtyRange.min) * CodeMapMesh.NUM_OF_COLOR_VECTOR_FIELDS

            colorAttribute.clearUpdateRanges()
            colorAttribute.addUpdateRange(startElement, countElements)
            deltaAttribute.clearUpdateRanges()
            deltaAttribute.addUpdateRange(startElement, countElements)
        }

        colorAttribute.needsUpdate = true
        deltaAttribute.needsUpdate = true

        this.dirtyRange = null
    }

    dispose() {
        this.disposeMesh()
        this.disposeMaterial()
    }

    private disposeMesh() {
        this.threeMesh?.geometry?.dispose()
    }

    private disposeMaterial() {
        this.material?.dispose()
    }

    setHeightScale(y: number) {
        this.heightScale = y
        if (this.material?.uniforms?.uBuildingHeightScale) {
            this.material.uniforms.uBuildingHeightScale.value = y
        }
    }

    private initMaterial() {
        const uniforms = UniformsUtils.merge([UniformsLib["lights"]])
        uniforms.uBuildingHeightScale = { value: 1.0 }

        const shaderCode = new CodeMapShaderStrings()

        this.material = new ShaderMaterial({
            vertexShader: shaderCode.vertexShaderCode,
            fragmentShader: shaderCode.fragmentShaderCode,
            lights: true,
            uniforms
        })
    }

    private calculatePickingRay(mouse: MousePos, camera: Camera) {
        const ray = new Ray()
        ray.origin.setFromMatrixPosition(camera.matrixWorld)
        ray.direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(ray.origin).normalize()

        return ray
    }

    private extractInstancedAttributes(): InstancedAttributes {
        const deltaAttr = this.threeMesh.geometry.getAttribute("delta")
        if (!deltaAttr) {
            throw new Error("CodeMapMesh: missing required geometry attribute 'delta'")
        }

        const isLeafAttr = this.threeMesh.geometry.getAttribute("isLeaf")
        if (!isLeafAttr) {
            throw new Error("CodeMapMesh: missing required geometry attribute 'isLeaf'")
        }

        const templateUvs = this.threeMesh.geometry.getAttribute("uv")
        if (!templateUvs) {
            throw new Error("CodeMapMesh: missing required geometry attribute 'uv'")
        }

        return {
            deltaAttr: deltaAttr as InstancedBufferAttribute,
            isLeafAttr: isLeafAttr as InstancedBufferAttribute,
            templateUvs: templateUvs as BufferAttribute
        }
    }

    private allocateExportBuffers(instanceCount: number): ExportBuffers {
        const totalVertices = instanceCount * verticesPerBox
        const totalIndices = instanceCount * indicesPerNode

        return {
            positions: new Float32Array(totalVertices * 3),
            normalsOut: new Float32Array(totalVertices * 3),
            colors: new Float32Array(totalVertices * 3),
            uvsOut: new Float32Array(totalVertices * 2),
            isHeightOut: new Float32Array(totalVertices),
            deltasOut: new Float32Array(totalVertices),
            deltaColorsOut: new Float32Array(totalVertices * 3),
            indices: new Uint32Array(totalIndices)
        }
    }

    private transformVertices(
        i: number,
        matrix: Matrix4,
        vertex: Vector3,
        normal: Vector3,
        attrs: InstancedAttributes,
        buffers: ExportBuffers
    ) {
        const vertexOffset = i * verticesPerBox
        const posOffset = vertexOffset * 3
        const uvOffset = vertexOffset * 2

        const building = this.mapGeomDesc.buildings[i]
        const defaultColor = building.getDefaultColorVector()
        const defaultDeltaColor = building.getDefaultDeltaColorVector()
        const instanceR = defaultColor.x
        const instanceG = defaultColor.y
        const instanceB = defaultColor.z
        const deltaR = defaultDeltaColor.x
        const deltaG = defaultDeltaColor.y
        const deltaB = defaultDeltaColor.z
        const deltaVal = attrs.deltaAttr.getX(i)
        const isLeaf = attrs.isLeafAttr.getX(i)

        const baseY = matrix.elements[13] // translation Y component

        for (let v = 0; v < verticesPerBox; v++) {
            vertex.set(templatePositions[v * 3], templatePositions[v * 3 + 1], templatePositions[v * 3 + 2])
            vertex.applyMatrix4(matrix)

            // Apply height scaling for leaves to match shader behavior
            if (isLeaf > 0.5 && this.heightScale !== 1.0) {
                vertex.y = baseY + (vertex.y - baseY) * this.heightScale
            }

            buffers.positions[posOffset + v * 3] = vertex.x
            buffers.positions[posOffset + v * 3 + 1] = vertex.y
            buffers.positions[posOffset + v * 3 + 2] = vertex.z

            normal.set(templateNormals[v * 3], templateNormals[v * 3 + 1], templateNormals[v * 3 + 2])
            normal.transformDirection(matrix)
            buffers.normalsOut[posOffset + v * 3] = normal.x
            buffers.normalsOut[posOffset + v * 3 + 1] = normal.y
            buffers.normalsOut[posOffset + v * 3 + 2] = normal.z

            buffers.colors[posOffset + v * 3] = instanceR
            buffers.colors[posOffset + v * 3 + 1] = instanceG
            buffers.colors[posOffset + v * 3 + 2] = instanceB

            buffers.deltaColorsOut[posOffset + v * 3] = deltaR
            buffers.deltaColorsOut[posOffset + v * 3 + 1] = deltaG
            buffers.deltaColorsOut[posOffset + v * 3 + 2] = deltaB

            buffers.uvsOut[uvOffset + v * 2] = attrs.templateUvs.getX(v)
            buffers.uvsOut[uvOffset + v * 2 + 1] = attrs.templateUvs.getY(v)

            buffers.isHeightOut[vertexOffset + v] = templateIsHeight[v] * isLeaf
            buffers.deltasOut[vertexOffset + v] = deltaVal
        }
    }

    private fillIndexBuffer(i: number, indices: Uint32Array) {
        const vertexOffset = i * verticesPerBox
        const indexOffset = i * indicesPerNode
        for (let j = 0; j < indicesPerNode; j++) {
            indices[indexOffset + j] = templateIndices[j] + vertexOffset
        }
    }

    private assembleExportGeometry(buffers: ExportBuffers): Mesh {
        const geometry = new BufferGeometry()
        geometry.setAttribute("position", new BufferAttribute(buffers.positions, 3))
        geometry.setAttribute("normal", new BufferAttribute(buffers.normalsOut, 3))
        geometry.setAttribute("color", new BufferAttribute(buffers.colors, 3))
        geometry.setAttribute("deltaColor", new BufferAttribute(buffers.deltaColorsOut, 3))
        geometry.setAttribute("uv", new BufferAttribute(buffers.uvsOut, 2))
        geometry.setAttribute("isHeight", new BufferAttribute(buffers.isHeightOut, 1))
        geometry.setAttribute("delta", new BufferAttribute(buffers.deltasOut, 1))
        geometry.setIndex(new BufferAttribute(buffers.indices, 1))
        geometry.addGroup(0, Number.POSITIVE_INFINITY, 0)

        const mat = this.threeMesh.material
        return new Mesh(geometry, Array.isArray(mat) ? mat : [mat])
    }
}
