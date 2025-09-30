import { Injectable } from "@angular/core"
import * as THREE from "three"
import { Node } from "../../../../codeCharta.model"

@Injectable({
    providedIn: "root"
})
export class StreetMapService {
    addStreetMapFloorLabels(
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
        for (const mesh of nodeObjects) {
            const node = mesh.userData.nodeData as Node
            if (!node.isLeaf && (node.depth ?? 0) < amountOfFloorLabels) {
                const label = this.createStreetMapFloorLabel(
                    node,
                    mesh,
                    floorLabelLength,
                    renderLabelNames,
                    minFloorLabelSize,
                    maxFloorLabelSize,
                    folderHeightMultiplier,
                    nodes
                )
                if (label) {
                    floorLabelSprites.push(label)
                    visualizationService.getScene().add(label)
                }
            }
        }
    }

    private createStreetMapFloorLabel(
        node: Node,
        nodeMesh: THREE.Mesh,
        floorLabelLength: number,
        renderLabelNames: boolean,
        minFloorLabelSize: number,
        maxFloorLabelSize: number,
        folderHeightMultiplier: number,
        allNodes: Node[]
    ): THREE.Sprite | null {
        const text = node.name
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        const textSize = 128
        const padding = 20

        // Set font and measure
        let textWidth = 0
        let textHeight = textSize
        if (context) {
            context.font = `bold ${textSize * 0.35}px Arial, sans-serif`
            const metrics = context.measureText(text)
            textWidth = metrics.width
            textHeight = textSize
        } else {
            textWidth = textSize * text.length * 0.6
        }
        canvas.width = textWidth + padding * 2
        canvas.height = textHeight + padding * 2

        if (context && renderLabelNames) {
            context.clearRect(0, 0, canvas.width, canvas.height)
            context.font = `bold ${textSize * 0.35}px Arial, sans-serif`
            context.textAlign = "center"
            context.textBaseline = "middle"
            context.strokeStyle = "white"
            context.lineWidth = 5
            context.strokeText(text, canvas.width / 2, canvas.height / 2)
            context.fillStyle = "black"
            context.fillText(text, canvas.width / 2, canvas.height / 2)
        }

        const texture = new THREE.CanvasTexture(canvas)
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: true,
            depthWrite: false
        })
        const sprite = new THREE.Sprite(material)

        // Label darf Folder überragen, aber nicht mit Files kollidieren
        const aspectRatio = canvas.width / canvas.height
        let scale = maxFloorLabelSize

        // Versuche, das Label so groß wie möglich zu machen, ohne mit Files zu kollidieren
        while (scale >= minFloorLabelSize) {
            const labelWidth = scale * aspectRatio
            const labelHeight = scale
            const labelBox = {
                x0: node.x0 + node.width / 2 - labelWidth / 2,
                y0: node.y0 + node.length / 2 - labelHeight / 2,
                x1: node.x0 + node.width / 2 + labelWidth / 2,
                y1: node.y0 + node.length / 2 + labelHeight / 2
            }
            let intersectsFile = false
            for (const other of allNodes) {
                if (!other.isLeaf) {
                    continue
                }
                const fileBox = {
                    x0: other.x0,
                    y0: other.y0,
                    x1: other.x0 + other.width,
                    y1: other.y0 + other.length
                }
                if (labelBox.x0 < fileBox.x1 && labelBox.x1 > fileBox.x0 && labelBox.y0 < fileBox.y1 && labelBox.y1 > fileBox.y0) {
                    intersectsFile = true
                    break
                }
            }
            if (!intersectsFile) {
                // Platz gefunden
                sprite.scale.set(labelWidth, labelHeight, 1)
                sprite.renderOrder = 9998
                const zOffset = folderHeightMultiplier / 4 + labelHeight / 7
                sprite.position.set(nodeMesh.position.x, nodeMesh.position.y, nodeMesh.position.z + zOffset)
                return sprite
            }
            scale -= 2 // Schrittweite für die Suche, ggf. anpassen
        }

        return null
    }
}
