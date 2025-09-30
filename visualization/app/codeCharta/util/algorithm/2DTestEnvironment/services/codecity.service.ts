import { Injectable } from "@angular/core"
import * as THREE from "three"
import { Node } from "../../../../codeCharta.model"

@Injectable({
    providedIn: "root"
})
export class CodeCityService {
    // Store previous label sizes by node path
    private labelSizeMap: Map<string, number> = new Map()

    addCodeCityFloorLabels(
        nodes,
        nodeObjects,
        visualizationService,
        floorLabelLength,
        amountOfFloorLabels,
        renderLabelNames,
        folderHeightMultiplier,
        floorLabelSprites,
        margin,
        minFloorLabelSize: number,
        maxFloorLabelSize: number
    ) {
        const maxX = Math.max(...nodes.map(node => node.x0 + node.width))
        const maxY = Math.max(...nodes.map(node => node.y0 + node.length))

        console.log(minFloorLabelSize, maxFloorLabelSize)

        for (const mesh of nodeObjects) {
            const node = mesh.userData.nodeData as Node
            if (this.shouldShowCodeCityFloorLabel(node, floorLabelLength, amountOfFloorLabels)) {
                const label = this.createCodeCityFloorLabel(
                    node.name,
                    mesh,
                    floorLabelLength,
                    renderLabelNames,
                    folderHeightMultiplier,
                    maxX,
                    maxY,
                    margin,
                    nodes,
                    minFloorLabelSize,
                    maxFloorLabelSize
                )
                if (!label) {
                    continue
                }
                floorLabelSprites.push(label)
                visualizationService.getScene().add(label)
            }
        }
    }

    private createLabelBox(node, scaledWidth, scaledHeight, paddingOffset) {
        return {
            x0: node.x0 + node.width - scaledWidth - paddingOffset,
            y0: node.y0 + node.length - scaledHeight - paddingOffset,
            x1: node.x0 + node.width - paddingOffset,
            y1: node.y0 + node.length - paddingOffset
        }
    }

    private doesLabelIntersectNodes(labelBox, node, nodes, paddingOffset) {
        const floorLabelWidth = labelBox.x1 - labelBox.x0
        const floorLabelLength = labelBox.y1 - labelBox.y0
        if (node.width - paddingOffset * 2 < floorLabelWidth || node.length - paddingOffset * 2 < floorLabelLength) {
            return true
        }

        for (const otherNode of nodes) {
            if (otherNode.depth <= node.depth) {
                continue
            }
            const nodeBox = {
                x0: otherNode.x0,
                y0: otherNode.y0,
                x1: otherNode.x0 + otherNode.width,
                y1: otherNode.y0 + otherNode.length
            }
            if (labelBox.x0 < nodeBox.x1 && labelBox.x1 > nodeBox.x0 && labelBox.y0 < nodeBox.y1 && labelBox.y1 > nodeBox.y0) {
                return true
            }
        }
        return false
    }

    private createCodeCityFloorLabel(
        text: string,
        nodeMesh: THREE.Mesh,
        floorLabelLength: number,
        renderLabelNames: boolean,
        folderHeightMultiplier: number,
        maxX: number,
        maxY: number,
        margin,
        nodes,
        minFloorLabelSize: number,
        maxFloorLabelSize: number
    ): THREE.Sprite | null {
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        const fontSize = 128
        const padding = 20
        const node = nodeMesh.userData.nodeData as Node

        // Set font first to get accurate measurements
        const fontStyle = `bold ${fontSize}px Arial, sans-serif`
        let textWidth = 0
        let textHeight = fontSize

        if (context) {
            context.font = fontStyle
            const metrics = context.measureText(text)
            textWidth = metrics.width
            textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent || fontSize
        } else {
            // Fallback calculation
            textWidth = fontSize * text.length * 0.6
        }

        // Set canvas dimensions with padding
        canvas.width = textWidth + padding * 2
        canvas.height = textHeight + padding * 2

        if (context && renderLabelNames) {
            context.clearRect(0, 0, canvas.width, canvas.height)
            context.font = fontStyle
            context.textAlign = "center"
            context.textBaseline = "middle"

            // Draw shadow for readability
            context.strokeStyle = "white"
            context.lineWidth = 8
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

        // Calculate scale to maintain aspect ratio, but clamp to maxFloorLabelSize
        const aspectRatio = canvas.width / canvas.height
        const baseScale = maxFloorLabelSize
        const scaledWidth = baseScale * aspectRatio
        const scaledHeight = baseScale
        const paddingOffset = margin / 10
        const labelWorldWidth = scaledWidth
        const nodeWorldWidth = node.width

        const nodeKey = node.path || node.name

        let finalWidth = scaledWidth
        let finalHeight = scaledHeight
        let usedScale = baseScale

        const xPos = node.x0 + node.width - maxX / 2 - finalWidth / 2 - paddingOffset
        const yPos = node.y0 + node.length - maxY / 2 - finalHeight / 2 - paddingOffset
        const zPos = node.depth * folderHeightMultiplier * 0.7 + node.length * 0.03 + 0.1

        const labelBox = this.createLabelBox(node, finalWidth, finalHeight, paddingOffset)
        const intersects = this.doesLabelIntersectNodes(labelBox, node, nodes, paddingOffset)

        if (intersects) {
            // Try previous size if available and not already used
            if (this.labelSizeMap.has(nodeKey)) {
                if (this.labelSizeMap.get(nodeKey) < minFloorLabelSize) {
                    return null
                }

                const previousScale = this.labelSizeMap.get(nodeKey)
                if (previousScale) {
                    usedScale = previousScale
                    finalWidth = usedScale * aspectRatio
                    finalHeight = usedScale
                    const prevLabelBox = this.createLabelBox(node, finalWidth, finalHeight, paddingOffset)
                    if (!this.doesLabelIntersectNodes(prevLabelBox, node, nodes, paddingOffset)) {
                        this.labelSizeMap.set(nodeKey, usedScale)
                        sprite.scale.set(finalWidth, finalHeight, 1)
                        sprite.position.set(
                            node.x0 + node.width - maxX / 2 - finalWidth / 2 - paddingOffset,
                            node.y0 + node.length - maxY / 2 - finalHeight / 2 - paddingOffset,
                            zPos
                        )
                        sprite.renderOrder = 9998
                        return sprite
                    }
                }
            }

            if (usedScale >= minFloorLabelSize) {
                const minScaledWidth = minFloorLabelSize * aspectRatio
                const minScaledHeight = minFloorLabelSize
                if (minScaledWidth + paddingOffset <= nodeWorldWidth) {
                    const minLabelBox = this.createLabelBox(node, minScaledWidth, minScaledHeight, paddingOffset)
                    if (!this.doesLabelIntersectNodes(minLabelBox, node, nodes, paddingOffset)) {
                        sprite.scale.set(minScaledWidth, minScaledHeight, 1)
                        sprite.position.set(
                            node.x0 + node.width - maxX / 2 - minScaledWidth / 2 - paddingOffset,
                            node.y0 + node.length - maxY / 2 - minScaledHeight / 2 - paddingOffset,
                            zPos
                        )
                        sprite.renderOrder = 9998
                        return sprite
                    }
                }
            }
            // No size fits without intersection
            return null
        }

        // Update labelSizeMap with the used scale
        this.labelSizeMap.set(nodeKey, usedScale)
        sprite.renderOrder = 9998
        sprite.position.set(xPos, yPos, zPos)
        sprite.scale.set(finalWidth, finalHeight, 1)
        return sprite
    }

    shouldShowCodeCityFloorLabel(node: Node, floorLabelLength: number, amountOfFloorLabels: number): boolean {
        return !node.isLeaf && (node.depth ?? 0) < amountOfFloorLabels
    }
}
