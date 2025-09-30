import { Injectable } from "@angular/core"
import * as THREE from "three"
import { Node } from "../../../../codeCharta.model"
import * as d3 from "d3-scale-chromatic"

@Injectable({
    providedIn: "root"
})
export class TreemapService {
    private readonly HIGHLIGHT_COLOR = new THREE.Color(0x007bff)

    renderNodes(
        nodes: Node[],
        scene: THREE.Scene,
        is3DView: boolean,
        folderHeightMultiplier: number,
        leafHeightMultiplier: number,
        selectedHeightMetric: string,
        heightMultipliers: Map<Node, number>
    ): THREE.Mesh[] {
        if (!scene) {
            console.error("Three.js scene not initialized")
            return []
        }

        const nodeObjects: THREE.Mesh[] = []
        const maxWidth = Math.max(...nodes.map(node => node.x0 + node.width))
        const maxLength = Math.max(...nodes.map(node => node.y0 + node.length))

        const offsetX = maxWidth / 2
        const offsetY = maxLength / 2

        // Calculate base heights with multipliers
        const base_leaf_height = (Math.max(maxWidth, maxLength) / 50) * leafHeightMultiplier
        const folder_height_per_depth = (Math.max(maxWidth, maxLength) / 1000) * folderHeightMultiplier

        const maxDepth = Math.max(...nodes.map(node => node.depth || 0), 1)

        for (const node of nodes) {
            if (node.width <= 0 || node.length <= 0) {
                console.warn("Skipping node with non-positive dimensions", node.name, node.width, node.length)
                continue
            }

            // Apply height metric multiplier for leaf nodes
            const heightMultiplier = selectedHeightMetric && node.isLeaf ? heightMultipliers.get(node) || 1 : 1
            const leaf_height_per_depth = base_leaf_height * heightMultiplier

            const geometry = new THREE.BoxGeometry(node.width, node.length, node.isLeaf ? leaf_height_per_depth : folder_height_per_depth)

            const normalizedDepth = (node.depth || 0) / maxDepth
            const nodeColor = this.interpolateColor(normalizedDepth)

            const material = new THREE.MeshLambertMaterial({
                color: nodeColor
            })

            const mesh = new THREE.Mesh(geometry, material)

            const zPos = node.isLeaf
                ? node.depth * folder_height_per_depth + leaf_height_per_depth / 2
                : node.depth * folder_height_per_depth + folder_height_per_depth / 2

            mesh.position.set(node.x0 + node.width / 2 - offsetX, node.y0 + node.length / 2 - offsetY, zPos || 0)
            mesh.castShadow = true
            mesh.receiveShadow = true

            mesh.userData = {
                nodeData: node
            }

            scene.add(mesh)
            nodeObjects.push(mesh)
        }

        return nodeObjects
    }

    addTreemapFloorLabels(
        nodeObjects: THREE.Mesh[],
        nodes: Node[],
        visualizationService: any,
        floorLabelLength: number,
        amountOfFloorLabels: number,
        renderLabelNames: boolean,
        floorLabelSprites: THREE.Sprite[],
        minFloorLabelSize: number,
        maxFloorLabelSize: number,
        folderHeightMultiplier: number
    ) {
        // Default treemap floor labels
        for (const mesh of nodeObjects) {
            const node = mesh.userData.nodeData as Node
            if (!node.isLeaf && (node.depth ?? 0) < amountOfFloorLabels) {
                const label = this.createFloorLabel(
                    node.name,
                    mesh,
                    floorLabelLength,
                    renderLabelNames,
                    minFloorLabelSize,
                    maxFloorLabelSize,
                    folderHeightMultiplier
                )
                floorLabelSprites.push(label)
                visualizationService.getScene().add(label)
            }
        }
    }

    private createFloorLabel(
        text: string,
        nodeMesh: THREE.Mesh,
        floorLabelLength: number,
        renderLabelNames: boolean,
        minFloorLabelSize: number,
        maxFloorLabelSize: number,
        folderHeightMultiplier: number
    ): THREE.Sprite {
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        const textSize = 128

        // Calculate proper canvas dimensions to avoid stretching
        const padding = 0
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
            depthTest: true,
            depthWrite: false
        })
        const sprite = new THREE.Sprite(material)

        const node = nodeMesh.userData.nodeData as Node
        let yOffset = 0
        let scale = 1
        let zOffset = 0

        const baseScale = Math.min(node.width * 0.08, node.length * 0.15) * floorLabelLength
        scale = Math.min(maxFloorLabelSize, Math.max(baseScale, minFloorLabelSize))

        yOffset = -node.length / 2 + floorLabelLength / 2

        // Ensure label doesn't exceed node width, accounting for proper aspect ratio
        const maxWidth = node.width * 0.8
        const aspectRatio = canvas.width / canvas.height
        const textWidth = scale * aspectRatio
        if (textWidth > maxWidth) {
            scale = maxWidth / aspectRatio
        }

        zOffset = folderHeightMultiplier / 4 + 0.1

        sprite.scale.set(scale * aspectRatio, scale, 1)
        sprite.renderOrder = 9998
        sprite.position.set(nodeMesh.position.x, nodeMesh.position.y + yOffset, nodeMesh.position.z + zOffset)

        return sprite
    }

    addBoxEdges(mesh: THREE.Mesh, scene: THREE.Scene): THREE.LineSegments {
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
        line.scale.copy(mesh.scale)
        line.rotation.copy(mesh.rotation)
        line.renderOrder = 1

        scene.add(line)
        return line
    }

    private interpolateColor(value: number): THREE.Color {
        value = Math.max(0, Math.min(1, value))
        const d3Color = d3.interpolateMagma(value)
        return new THREE.Color(d3Color)
    }
}
