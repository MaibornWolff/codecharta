import { Box3, InstancedBufferAttribute, InstancedMesh, Material, Matrix4, Vector3 } from "three"
import { CcState, Node } from "../../../model/codeCharta.model"
import { ColorConverter } from "../../../util/color/colorConverter"
import { treeMapSize } from "../algorithm/treeMapLayout/treeMapHelper"
import { CodeMapBuilding } from "./codeMapBuilding"
import { CodeMapGeometricDescription } from "./codeMapGeometricDescription"
import { BoxMeasures, createTemplateBoxGeometry } from "./geometryGenerationHelper"

export interface BuildResult {
    mesh: InstancedMesh
    desc: CodeMapGeometricDescription
}

interface InstanceData {
    measures: BoxMeasures
    color: string
    normalizedDelta: number
    isLeaf: number
}

interface BuildContext {
    desc: CodeMapGeometricDescription
    instanceColors: Float32Array
    instanceDeltaColors: Float32Array
    instanceDeltas: Float32Array
    instanceIsLeaf: Float32Array
    matrix: Matrix4
    position: Vector3
    scale: Vector3
    mesh: InstancedMesh
}

export class GeometryGenerator {
    /** Minimum height in scene units so that every building remains visible,
     *  even when its height metric value rounds to zero. */
    private static readonly MINIMAL_BUILDING_HEIGHT = 1

    private floorGradient: string[]

    build(nodes: Node[], material: Material, state: CcState, isDeltaState: boolean): BuildResult {
        this.floorGradient = ColorConverter.gradient("#333333", "#DDDDDD", this.getMaxNodeDepth(nodes))

        const count = nodes.length
        const templateGeometry = createTemplateBoxGeometry()

        const ctx: BuildContext = {
            desc: new CodeMapGeometricDescription(treeMapSize),
            instanceColors: new Float32Array(count * 3),
            instanceDeltaColors: new Float32Array(count * 3),
            instanceDeltas: new Float32Array(count),
            instanceIsLeaf: new Float32Array(count),
            matrix: new Matrix4(),
            position: new Vector3(),
            scale: new Vector3(),
            mesh: new InstancedMesh(templateGeometry, material, count)
        }

        templateGeometry.setAttribute("color", new InstancedBufferAttribute(ctx.instanceColors, 3))
        templateGeometry.setAttribute("deltaColor", new InstancedBufferAttribute(ctx.instanceDeltaColors, 3))
        templateGeometry.setAttribute("delta", new InstancedBufferAttribute(ctx.instanceDeltas, 1))
        templateGeometry.setAttribute("isLeaf", new InstancedBufferAttribute(ctx.instanceIsLeaf, 1))

        for (const [index, node] of nodes.entries()) {
            this.fillInstance(index, node, state, isDeltaState, ctx)
        }

        // InstancedMesh bounding sphere is computed from template geometry only (unit box).
        // Disable frustum culling so the mesh is always drawn regardless of camera position.
        ctx.mesh.frustumCulled = false

        return { mesh: ctx.mesh, desc: ctx.desc }
    }

    private getMaxNodeDepth(nodes: Node[]) {
        return nodes.reduce((max, { depth }) => Math.max(depth, max), 0)
    }

    private mapNodeToLocalBox(node: Node): BoxMeasures {
        return {
            x: node.x0,
            y: node.z0,
            z: node.y0,
            width: node.width,
            height: node.height,
            depth: node.length
        }
    }

    private ensureMinHeightUnlessDeltaIsNegative(height: number, delta: number) {
        return delta <= 0 ? height : Math.max(height, GeometryGenerator.MINIMAL_BUILDING_HEIGHT)
    }

    /**
     * Re-place the buildings the last `build()` produced onto a new layout, reusing the buffers
     * already on the GPU. Only valid when the new layout holds the same nodes in the same order —
     * `CodeMapMesh.canUpdateInPlace` is the caller's check.
     */
    update(nodes: Node[], mesh: InstancedMesh, desc: CodeMapGeometricDescription, state: CcState, isDeltaState: boolean) {
        this.floorGradient = ColorConverter.gradient("#333333", "#DDDDDD", this.getMaxNodeDepth(nodes))

        const { geometry } = mesh
        const ctx: BuildContext = {
            desc,
            instanceColors: attributeArray(geometry, "color"),
            instanceDeltaColors: attributeArray(geometry, "deltaColor"),
            instanceDeltas: attributeArray(geometry, "delta"),
            instanceIsLeaf: attributeArray(geometry, "isLeaf"),
            matrix: new Matrix4(),
            position: new Vector3(),
            scale: new Vector3(),
            mesh
        }

        const boundingBox = new Box3()
        for (const [index, node] of nodes.entries()) {
            const instance = this.instanceDataFor(node, state, isDeltaState)
            const { measures } = instance
            boundingBox.min.set(measures.x, measures.y, measures.z)
            boundingBox.max.set(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth)
            desc.buildings[index].relayout(node, boundingBox, instance.color)
            this.writeInstance(index, instance, ctx)
        }

        desc.markBuildingsChanged()
        mesh.instanceMatrix.needsUpdate = true
        for (const name of ["color", "deltaColor", "delta", "isLeaf"]) {
            const attribute = geometry.getAttribute(name) as InstancedBufferAttribute
            attribute.clearUpdateRanges()
            attribute.needsUpdate = true
        }
    }

    /** Repaint buildings the last `build()` produced, for a change that moved none of them. */
    recolorBuildings(nodes: Node[], buildings: CodeMapBuilding[]) {
        this.floorGradient = ColorConverter.gradient("#333333", "#DDDDDD", this.getMaxNodeDepth(nodes))
        for (const building of buildings) {
            building.resetDefaultColor(this.colorForNode(nodes[building.id]))
        }
    }

    private colorForNode(node: Node) {
        return node.isLeaf ? node.color : this.getMarkingColorWithGradient(node)
    }

    private fillInstance(index: number, node: Node, state: CcState, isDeltaState: boolean, ctx: BuildContext) {
        const instance = this.instanceDataFor(node, state, isDeltaState)
        this.addBuildingToDesc(index, instance.measures, node, instance.color, ctx.desc)
        this.writeInstance(index, instance, ctx)
    }

    private instanceDataFor(node: Node, state: CcState, isDeltaState: boolean): InstanceData {
        const measures = this.mapNodeToLocalBox(node)

        if (!node.isLeaf) {
            return { measures, color: this.colorForNode(node), normalizedDelta: 0, isLeaf: 0 }
        }

        measures.height = this.ensureMinHeightUnlessDeltaIsNegative(node.height, node.heightDelta)

        let renderDelta = 0
        if (isDeltaState && node.deltas?.[state.mapState.heightMetric] && node.heightDelta) {
            renderDelta = node.heightDelta

            if (!node.flat && renderDelta < 0) {
                measures.height += Math.abs(renderDelta)
            }
        }

        const normalizedDelta = measures.height > 0 ? renderDelta / measures.height : 0
        return { measures, color: node.color, normalizedDelta, isLeaf: 1 }
    }

    private writeInstance(index: number, { measures, color, normalizedDelta, isLeaf }: InstanceData, ctx: BuildContext) {
        this.setInstanceTransform(index, measures, ctx)
        this.setInstanceColor(index, color, ctx.instanceColors)
        this.setInstanceColor(index, color, ctx.instanceDeltaColors)
        ctx.instanceDeltas[index] = normalizedDelta
        ctx.instanceIsLeaf[index] = isLeaf
    }

    private getMarkingColorWithGradient(node: Node) {
        if (node.markingColor) {
            const markingColorAsNumber = ColorConverter.getNumber(node.markingColor)
            const markingColorWithGradient = this.applyDepthGradient(markingColorAsNumber, node.depth)
            return ColorConverter.convertNumberToHex(markingColorWithGradient)
        }
        return this.floorGradient[node.depth]
    }

    /**
     * Darkens a floor's marking color based on its depth in the tree.
     * Odd-depth floors keep full brightness (mask 0xffffff), while even-depth
     * floors are dimmed by masking with 0xdddddd, creating a subtle alternating
     * depth gradient that makes nesting levels visually distinguishable.
     */
    private applyDepthGradient(color: number, depth: number): number {
        const mask = depth % 2 === 0 ? 0xdd_dd_dd : 0xff_ff_ff
        return color & mask
    }

    private addBuildingToDesc(index: number, measures: BoxMeasures, node: Node, color: string, desc: CodeMapGeometricDescription) {
        desc.add(
            new CodeMapBuilding(
                index,
                new Box3(
                    new Vector3(measures.x, measures.y, measures.z),
                    new Vector3(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth)
                ),
                node,
                color
            )
        )
    }

    private setInstanceTransform(index: number, measures: BoxMeasures, ctx: BuildContext) {
        ctx.position.set(measures.x, measures.y, measures.z)
        ctx.scale.set(measures.width, measures.height, measures.depth)
        ctx.matrix.makeScale(ctx.scale.x, ctx.scale.y, ctx.scale.z)
        ctx.matrix.setPosition(ctx.position)
        ctx.mesh.setMatrixAt(index, ctx.matrix)
    }

    private setInstanceColor(index: number, color: string, target: Float32Array) {
        const rgb = ColorConverter.getVector3Array(color)
        target[index * 3] = rgb[0]
        target[index * 3 + 1] = rgb[1]
        target[index * 3 + 2] = rgb[2]
    }
}

function attributeArray(geometry: InstancedMesh["geometry"], name: string): Float32Array {
    return geometry.getAttribute(name).array as Float32Array
}
