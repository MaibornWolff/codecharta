import { Injectable } from "@angular/core"
import * as THREE from "three"
import { Node } from "../../../../codeCharta.model"
import * as d3 from "d3-scale-chromatic"

@Injectable({
    providedIn: "root"
})
export class SunburstService {
    renderNodes(
        nodes: Node[],
        scene: THREE.Scene,
        is3DView: boolean,
        maxSunburstRadius: number,
        folderHeightMultiplier: number,
        leafHeightMultiplier: number,
        folderLengthMultiplier: number,
        fileLengthMultiplier: number,
        selectedHeightMetric: string,
        heightMultipliers: Map<Node, number>
    ): { nodeObjects: THREE.Mesh[]; viewSize: number; minY0: number } {
        if (!scene) {
            console.error("Three.js scene not initialized")
            return { nodeObjects: [], viewSize: 0, minY0: 0 }
        }

        const nodeObjects: THREE.Mesh[] = []
        const maxDepth = Math.max(...nodes.map(n => n.depth || 0), 1)
        const maxWidth = Math.max(...nodes.map(node => node.width))
        const radiusFactor = (maxSunburstRadius / maxWidth / 360) * Math.PI * 2
        let maxDistanceToCenter = 0

        const base_height_per_depth = is3DView ? (maxWidth / 1000) * ((folderHeightMultiplier + leafHeightMultiplier) / 2) : 10

        // Find the minimum y0 value to determine the offset needed to start from center
        const minY0 = Math.min(...nodes.map(node => node.y0))

        for (const node of nodes) {
            const startAngel = node.x0 * radiusFactor
            const widthAngle = node.width * radiusFactor

            // Apply length multipliers to the radial size
            const baseLengthMultiplier = node.isLeaf ? fileLengthMultiplier : folderLengthMultiplier
            const length = node.length * baseLengthMultiplier

            // Start from center by subtracting minY0 and applying folder length multiplier
            const distanceToCenter = (node.y0 - minY0) * folderLengthMultiplier

            if (distanceToCenter + length > maxDistanceToCenter) {
                maxDistanceToCenter = distanceToCenter + length
            }

            // Calculate the height for this specific node
            let nodeHeight = base_height_per_depth
            if (node.isLeaf && selectedHeightMetric) {
                const heightMultiplier = heightMultipliers.get(node) || 1
                nodeHeight = base_height_per_depth * heightMultiplier * leafHeightMultiplier
            } else if (node.isLeaf) {
                nodeHeight = base_height_per_depth * leafHeightMultiplier
            } else {
                nodeHeight = base_height_per_depth * folderHeightMultiplier
            }

            // Get the Z position for this depth
            const zPosition = node.depth * base_height_per_depth * folderHeightMultiplier + nodeHeight

            const mesh = this.create3DRingPart(
                distanceToCenter,
                distanceToCenter + length,
                startAngel,
                widthAngle,
                node.depth,
                maxDepth,
                nodeHeight,
                zPosition
            )

            // Add node data to mesh userData
            mesh.userData = {
                nodeData: node
            }

            scene.add(mesh)
            nodeObjects.push(mesh)
        }

        // Rotate the scene so the "opening" is at the bottom
        scene.rotation.z = ((360 - maxSunburstRadius) / 360) * Math.PI * 2 + Math.PI / 2

        const viewSize = maxDistanceToCenter * 2.1

        return { nodeObjects, viewSize, minY0 }
    }

    addSunburstFloorLabels(
        nodes,
        maxSunburstRadius,
        nodeObjects,
        visualizationService,
        floorLabelLength,
        renderLabelNames,
        folderLengthMultiplier,
        fileLengthMultiplier,
        floorLabelSprites
    ) {
        const maxWidth = Math.max(...nodes.map(node => node.width))
        const radiusFactor = (maxSunburstRadius / maxWidth / 360) * Math.PI * 2
        const minY0 = Math.min(...nodes.map(node => node.y0))
        const rotateAngle = ((360 - maxSunburstRadius) / 360) * Math.PI * 2 + Math.PI / 2

        for (const mesh of nodeObjects) {
            const node = mesh.userData.nodeData as Node
            const centerRadian = (node.x0 + node.width / 2) * radiusFactor + rotateAngle
            const factor = Math.sin(centerRadian / 2) ** 2
            if (!node.isLeaf && node.width * radiusFactor * 5 > 1.2 * factor) {
                const label = this.createSunburstFloorLabel(
                    node.name,
                    mesh,
                    node,
                    radiusFactor,
                    minY0,
                    rotateAngle,
                    floorLabelLength,
                    renderLabelNames,
                    folderLengthMultiplier,
                    fileLengthMultiplier
                )
                floorLabelSprites.push(label)
                visualizationService.getScene().add(label)
            }
        }
    }

    private createSunburstFloorLabel(
        text: string,
        nodeMesh: THREE.Mesh,
        node: Node,
        radiusFactor: number,
        minY0: number,
        rotateAngle: number,
        floorLabelLength: number,
        renderLabelNames: boolean,
        folderLengthMultiplier: number,
        fileLengthMultiplier: number
    ): THREE.Sprite {
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        const textSize = 128

        // Calculate proper canvas dimensions to avoid stretching
        const padding = 20
        if (context) {
            context.font = `bold ${textSize * 0.35}px Arial, sans-serif`
            const textWidth = context.measureText(text).width
            canvas.width = textWidth + padding * 2
            canvas.height = textSize
        } else {
            canvas.width = Math.max(textSize * text.length * 0.6, textSize)
            canvas.height = textSize
        }

        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height)
            if (renderLabelNames) {
                context.font = `bold ${textSize * 0.35}px Arial, sans-serif`
                context.textAlign = "center"
                context.textBaseline = "middle"
                // Draw shadow for readability
                context.strokeStyle = "white"
                context.lineWidth = 5
                context.strokeText(text, canvas.width / 2, canvas.height / 2)
                context.fillStyle = "black"
                context.fillText(text, canvas.width / 2, canvas.height / 2)
            }
        }

        const texture = new THREE.CanvasTexture(canvas)
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        })
        const sprite = new THREE.Sprite(material)

        // Calculate sunburst-specific positioning
        const startAngle = node.x0 * radiusFactor
        const widthAngle = node.width * radiusFactor
        const centerAngle = startAngle + widthAngle / 2 + 0

        // Apply length multipliers to the radial size
        const baseLengthMultiplier = node.isLeaf ? fileLengthMultiplier : folderLengthMultiplier
        const length = node.length * baseLengthMultiplier

        // Start from center by subtracting minY0 and applying folder length multiplier
        const distanceToCenter = (node.y0 - minY0) * folderLengthMultiplier
        const middleDistanceToCenter = distanceToCenter + length / 2

        // Apply the coordinates with the correct angle
        const x = Math.cos(-centerAngle) * middleDistanceToCenter
        const y = Math.sin(-centerAngle) * middleDistanceToCenter

        sprite.position.set(x, y, nodeMesh.position.z + 50)

        const scale = 100 * floorLabelLength
        const aspectRatio = canvas.width / canvas.height
        sprite.scale.set(scale * aspectRatio, scale, 1)
        sprite.renderOrder = 9998

        return sprite
    }

    addSunburstEdges(mesh: THREE.Mesh, node: Node, scene: THREE.Scene): THREE.LineSegments {
        const edges = new THREE.EdgesGeometry(mesh.geometry)
        const mat = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1,
            linecap: "round",
            linejoin: "round",
            transparent: false,
            opacity: 1,
            depthTest: true,
            depthWrite: true
        })

        const line = new THREE.LineSegments(edges, mat)
        line.position.copy(mesh.position)
        line.rotation.copy(mesh.rotation)
        line.renderOrder = 1

        scene.add(line)
        return line
    }

    private create3DRingPart(
        innerRadius: number,
        outerRadius: number,
        startAngle: number,
        angleLength: number,
        depth: number,
        maxDepth: number,
        height: number,
        zPosition: number
    ): THREE.Mesh {
        const shape = new THREE.Shape()

        shape.absarc(0, 0, outerRadius, startAngle, startAngle + angleLength, false)
        shape.absarc(0, 0, innerRadius, startAngle + angleLength, startAngle, true)

        const curveSegments = Math.max((angleLength / (Math.PI * 2)) * 128, 64)

        const extrudeSettings = {
            depth: height,
            bevelEnabled: false,
            curveSegments
        }

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)

        const normalizedDepth = (depth || 0) / maxDepth
        const nodeColor = this.interpolateColor(normalizedDepth)
        const material = new THREE.MeshLambertMaterial({
            color: nodeColor
        })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(0, 0, zPosition)
        mesh.rotation.x = Math.PI
        mesh.castShadow = true
        mesh.receiveShadow = true
        return mesh
    }

    private interpolateColor(value: number): THREE.Color {
        value = Math.max(0, Math.min(1, value))
        const d3Color = d3.interpolateMagma(value)
        return new THREE.Color(d3Color)
    }
}
