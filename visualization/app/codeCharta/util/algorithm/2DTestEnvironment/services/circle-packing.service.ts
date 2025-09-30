import { Injectable } from "@angular/core"
import * as THREE from "three"
import { Node } from "../../../../codeCharta.model"
import * as d3 from "d3-scale-chromatic"

@Injectable({
    providedIn: "root"
})
export class CirclePackingService {
    renderNodes(
        nodes: Node[],
        scene: THREE.Scene,
        leafHeightMultiplier: number,
        folderHeightMultiplier: number,
        selectedHeightMetric: string,
        heightMultipliers: Map<Node, number>
    ): { nodeObjects: THREE.Mesh[]; viewSize: number } {
        if (!scene) {
            console.error("Three.js scene not initialized")
            return { nodeObjects: [], viewSize: 0 }
        }

        const nodeObjects: THREE.Mesh[] = []
        if (nodes.length === 0) {
            return { nodeObjects, viewSize: 0 }
        }

        const { offsetX, offsetY, viewSize, maxDepth, baseLeafHeight, folderHeight } = this.calculateSceneLayout(
            nodes,
            leafHeightMultiplier,
            folderHeightMultiplier
        )

        for (const node of nodes) {
            if (node.width <= 0) {
                continue
            }

            const mesh = this.createNodeMesh(
                node,
                offsetX,
                offsetY,
                maxDepth,
                baseLeafHeight,
                folderHeight,
                selectedHeightMetric,
                heightMultipliers
            )
            scene.add(mesh)
            nodeObjects.push(mesh)
        }

        return { nodeObjects, viewSize }
    }

    addCirclePackingFloorLabels(
        nodeObjects: THREE.Mesh[],
        nodes: Node[],
        visualizationService,
        floorLabelLength,
        amountOfFloorLabels,
        renderLabelNames,
        floorLabelSprites: THREE.Sprite[],
        minFloorLabelSize: number,
        maxFloorLabelSize: number
    ) {
        const fixedXOffset = nodes[0].x0
        const fixedYOffset = nodes[0].y0

        for (const mesh of nodeObjects) {
            const node = mesh.userData.nodeData as Node
            if (!node.isLeaf && (node.depth ?? 0) < amountOfFloorLabels) {
                const label = this.createCirclePackingFloorLabel(
                    node.name,
                    mesh,
                    node,
                    floorLabelLength,
                    renderLabelNames,
                    minFloorLabelSize,
                    maxFloorLabelSize,
                    fixedXOffset,
                    fixedYOffset
                )
                floorLabelSprites.push(label)
                visualizationService.getScene().add(label)
            }
        }
    }

    addCirclePackingEdges(
        mesh: THREE.Mesh,
        node: { width: number },
        scene: THREE.Scene
    ): THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[], THREE.Object3DEventMap> {
        const radius = Math.max(node.width, 0.1)
        const segments = 64
        const height = mesh.userData.cylinderHeight ?? 0
        const positions: number[] = []

        this.addCircleEdgePositions(positions, radius, height, segments)

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
        const material = new THREE.LineBasicMaterial({ color: 0x000000 })
        const line = new THREE.Line(geometry, material)
        line.position.copy(mesh.position)
        line.rotation.copy(mesh.rotation)
        line.renderOrder = 9999
        scene.add(line)
        return line
    }

    private calculateSceneLayout(nodes: Node[], leafHeightMultiplier: number, folderHeightMultiplier: number) {
        const minX = Math.min(...nodes.map(n => n.x0 - n.width))
        const maxX = Math.max(...nodes.map(n => n.x0 + n.width))
        const minY = Math.min(...nodes.map(n => n.y0 - n.width))
        const maxY = Math.max(...nodes.map(n => n.y0 + n.width))
        const offsetX = (minX + maxX) / 2
        const offsetY = (minY + maxY) / 2
        const viewSize = Math.max(maxX - minX, maxY - minY) * 1.1
        const maxDepth = Math.max(...nodes.map(n => n.depth || 0), 1)
        const baseLeafHeight = Math.max(viewSize / 100, 2) * leafHeightMultiplier
        const folderHeight = Math.max(viewSize / 100, 2) * folderHeightMultiplier
        return { offsetX, offsetY, viewSize, maxDepth, baseLeafHeight, folderHeight }
    }

    private createNodeMesh(
        node: Node,
        offsetX: number,
        offsetY: number,
        maxDepth: number,
        baseLeafHeight: number,
        folderHeight: number,
        selectedHeightMetric: string,
        heightMultipliers: Map<Node, number>
    ): THREE.Mesh {
        const x = node.x0 - offsetX
        const y = node.y0 - offsetY
        const radius = Math.max(node.width, 0.1)
        const normalizedDepth = (node.depth || 0) / maxDepth
        const color = this.interpolateColor(normalizedDepth)
        const heightMultiplier = selectedHeightMetric && node.isLeaf ? heightMultipliers.get(node) || 1 : 1
        const nodeHeight = node.isLeaf ? baseLeafHeight * heightMultiplier : folderHeight
        const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, nodeHeight, 64)
        const circleMaterial = new THREE.MeshLambertMaterial({ color: color })
        const circleMesh = new THREE.Mesh(cylinderGeometry, circleMaterial)
        circleMesh.position.set(x, y, node.depth * folderHeight + nodeHeight / 2)
        circleMesh.rotation.x = Math.PI / 2
        circleMesh.castShadow = true
        circleMesh.receiveShadow = true
        circleMesh.userData = {
            nodeData: node,
            cylinderHeight: nodeHeight
        }
        return circleMesh
    }

    private interpolateColor(value: number): THREE.Color {
        value = Math.max(0, Math.min(1, value))
        const d3Color = d3.interpolateMagma(value)
        return new THREE.Color(d3Color)
    }

    private addCircleEdgePositions(positions: number[], radius: number, height: number, segments: number) {
        const addCircle = (y: number) => {
            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2
                const x = radius * Math.cos(theta)
                const z = radius * Math.sin(theta)
                positions.push(x, y, z)
            }
        }
        addCircle(height / 2)
        addCircle(-height / 2)
    }

    private createCirclePackingFloorLabel(
        text: string,
        nodeMesh: THREE.Mesh,
        node: Node,
        floorLabelLength: number,
        renderLabelNames: boolean,
        minFloorLabelSize: number,
        maxFloorLabelSize: number,
        fixedXOffset: number,
        fixedYOffset: number
    ): THREE.Sprite {
        const { canvas, aspectRatio } = this.createLabelCanvas(text, renderLabelNames)
        const texture = new THREE.CanvasTexture(canvas)
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: true,
            depthWrite: false
        })
        const sprite = new THREE.Sprite(material)

        const radius = Math.max(node.width, 0.1)
        const { bestScale, bestPos } = this.findBestLabelPlacement(
            node,
            nodeMesh,
            aspectRatio,
            minFloorLabelSize,
            maxFloorLabelSize,
            radius
        )

        let finalX: number, finalY: number, finalScale: number
        if (bestPos) {
            finalX = bestPos.x - nodeMesh.position.x - fixedXOffset
            finalY = bestPos.y - nodeMesh.position.y - fixedYOffset
            finalScale = bestScale
        } else {
            finalX = 0 - fixedXOffset
            finalY = 0 - fixedYOffset
            const maxRectScale = (radius * Math.SQRT2) / Math.sqrt(aspectRatio * aspectRatio + 1)
            finalScale = Math.max(minFloorLabelSize, Math.min(maxFloorLabelSize, maxRectScale * floorLabelLength))
        }

        sprite.scale.set(finalScale * aspectRatio, finalScale, 1)
        const z = nodeMesh.position.z + (nodeMesh.userData.cylinderHeight ?? 0) / 2 + 20
        sprite.position.set(nodeMesh.position.x + finalX, nodeMesh.position.y + finalY, z)
        sprite.renderOrder = 9998
        return sprite
    }

    private createLabelCanvas(text: string, renderLabelNames: boolean): { canvas: HTMLCanvasElement; aspectRatio: number } {
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        const textSize = 128
        const padding = 20
        let textWidth = textSize * text.length * 0.6
        if (context) {
            context.font = `bold ${textSize * 0.35}px Arial, sans-serif`
            textWidth = context.measureText(text).width
            canvas.width = textWidth + padding * 2
            canvas.height = textSize
        } else {
            canvas.width = textWidth + padding * 2
            canvas.height = textSize
        }
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height)
            if (renderLabelNames) {
                context.font = `bold ${textSize * 0.35}px Arial, sans-serif`
                context.textAlign = "center"
                context.textBaseline = "middle"
                context.strokeStyle = "white"
                context.lineWidth = 5
                context.strokeText(text, canvas.width / 2, canvas.height / 2)
                context.fillStyle = "black"
                context.fillText(text, canvas.width / 2, canvas.height / 2)
            }
        }
        const aspectRatio = canvas.width / canvas.height
        return { canvas, aspectRatio }
    }

    private findBestLabelPlacement(
        node: Node,
        nodeMesh: THREE.Mesh,
        aspectRatio: number,
        minFloorLabelSize: number,
        maxFloorLabelSize: number,
        radius: number
    ): { bestScale: number; bestPos: { x: number; y: number } | null } {
        const steps = 32
        let bestScale = 0
        let bestPos: { x: number; y: number } | null = null
        const allNodes = (nodeMesh.parent?.children ?? [])
            .map(obj => obj.userData?.nodeData)
            .filter(n => n && typeof n.x0 === "number" && typeof n.y0 === "number") as Node[]

        for (let i = 0; i < steps; i++) {
            const angle = (2 * Math.PI * i) / steps
            const offset = radius + 0.05
            const cx = node.x0 + Math.cos(angle) * offset
            const cy = node.y0 + Math.sin(angle) * offset
            let scale = maxFloorLabelSize
            while (scale >= minFloorLabelSize) {
                const labelW = scale * aspectRatio
                const labelH = scale
                if (this.isLabelAreaFree(cx, cy, labelW, labelH, allNodes, node)) {
                    if (scale > bestScale) {
                        bestScale = scale
                        bestPos = { x: cx, y: cy }
                    }
                    break
                }
                scale -= 0.05
            }
        }
        return { bestScale, bestPos }
    }

    private isLabelAreaFree(cx: number, cy: number, labelW: number, labelH: number, allNodes: Node[], selfNode: Node): boolean {
        for (const other of allNodes) {
            if (other.depth <= selfNode.depth) {
                continue
            }
            const dx = cx - other.x0
            const dy = cy - other.y0
            const dist = Math.sqrt(dx * dx + dy * dy)
            const corners = [
                [cx - labelW / 2, cy - labelH / 2],
                [cx + labelW / 2, cy - labelH / 2],
                [cx - labelW / 2, cy + labelH / 2],
                [cx + labelW / 2, cy + labelH / 2]
            ]
            for (const [px, py] of corners) {
                const d = Math.sqrt((px - other.x0) ** 2 + (py - other.y0) ** 2)
                if (d < other.width) {
                    return false
                }
            }
            if (dist < other.width + Math.max(labelW, labelH) / 2) {
                return false
            }
        }
        return true
    }
}
