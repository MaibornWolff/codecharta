"use strict"

import { Node } from "../../../../codeCharta.model"
import { CanvasTexture, BackSide, Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping, Vector3 } from "three"
import { FloorLabelHelper } from "./floorLabelHelper"

export class FloorLabelDrawer {
	private floorLabelPlanes: Mesh[] = []
	private readonly rootNode: Node
	private readonly mapSize: number
	private readonly scaling: Vector3

	private floorLabelsPerLevel = new Map()

	constructor(nodes: Node[], rootNode: Node, mapSize: number, scaling: Vector3) {
		this.collectLabelsPerLevel(nodes)
		this.rootNode = rootNode
		this.mapSize = mapSize
		this.scaling = scaling
	}

	private collectLabelsPerLevel(nodes: Node[]) {
		for (const node of nodes) {
			if (FloorLabelHelper.isLabelNode(node)) {
				if (!this.floorLabelsPerLevel.has(node.mapNodeDepth)) {
					this.floorLabelsPerLevel.set(node.mapNodeDepth, [])
				}
				this.floorLabelsPerLevel.get(node.mapNodeDepth).push(node)
			}
		}
	}

	draw() {
		const { width: rootNodeWidth, length: rootNodeHeight } = this.rootNode
		const mapResolutionScaling = FloorLabelHelper.getMapResolutionScaling(rootNodeWidth)

		const scaledMapWidth = rootNodeWidth * mapResolutionScaling
		const scaledMapHeight = rootNodeHeight * mapResolutionScaling

		for (const [floorLevel, floorNodesPerLevel] of this.floorLabelsPerLevel) {
			const { textCanvas, context } = this.createLabelPlaneCanvas(scaledMapWidth, scaledMapHeight)
			this.writeLabelsOnCanvas(context, floorNodesPerLevel, mapResolutionScaling)
			this.drawLevelPlaneGeometry(textCanvas, scaledMapWidth, scaledMapHeight, floorLevel, mapResolutionScaling)
		}

		return this.floorLabelPlanes
	}

	private createLabelPlaneCanvas(scaledMapWidth: number, scaledMapHeight: number) {
		const textCanvas = document.createElement("canvas")

		// Flip map width and height to support non squarified maps (e.g. if a rectangular subfolder is focused)
		let textCanvasWidth = scaledMapWidth
		let textCanvasHeight = scaledMapHeight

		if (scaledMapWidth > scaledMapHeight) {
			textCanvasWidth = scaledMapHeight
			textCanvasHeight = scaledMapWidth
		}

		textCanvas.width = textCanvasWidth
		textCanvas.height = textCanvasHeight

		const context = textCanvas.getContext("2d")

		context.fillStyle = "white"
		context.textAlign = "center"
		context.textBaseline = "middle"

		return { textCanvas, context }
	}

	private writeLabelsOnCanvas(context: CanvasRenderingContext2D, floorNodesOfCurrentLevel: Node[], mapResolutionScaling: number) {
		const { width: rootNodeWidth, length: rootNodeHeight } = this.rootNode

		for (const floorNode of floorNodesOfCurrentLevel) {
			let fontSize =
				floorNode.depth === 0 ? Math.max(Math.floor(rootNodeWidth * 0.03), 120) : Math.max(Math.floor(rootNodeWidth * 0.023), 95)
			fontSize = fontSize * mapResolutionScaling

			context.font = `${fontSize}px Arial`

			const textToFill = this.getLabelAndSetContextFont(floorNode, context, mapResolutionScaling, fontSize)

			context.fillText(
				textToFill.labelText,
				(rootNodeHeight - floorNode.y0 - floorNode.length / 2) * mapResolutionScaling,
				(floorNode.x0 + floorNode.width) * mapResolutionScaling - textToFill.fontSize / 2
			)
		}
	}

	private drawLevelPlaneGeometry(textCanvas, scaledMapWidth, scaledMapHeight, floorLevel, mapResolutionScaling) {
		const labelTexture = new CanvasTexture(textCanvas)
		labelTexture.wrapS = RepeatWrapping
		labelTexture.wrapT = RepeatWrapping
		labelTexture.repeat.x = -1
		labelTexture.needsUpdate = true
		labelTexture.rotation = (90 * Math.PI) / 180

		const plane = new PlaneGeometry(scaledMapWidth, scaledMapHeight)
		const material = new MeshBasicMaterial({
			side: BackSide,
			map: labelTexture,
			transparent: true
		})

		const planeMesh = new Mesh(plane, material)

		// Rotate plane to be horizontally
		planeMesh.rotateX((90 * Math.PI) / 180)

		// Position plane over the map
		const liftToPreventZFighting = 10
		plane.translate(scaledMapWidth / 2, scaledMapHeight / 2, -2.01 * (floorLevel + 1) - liftToPreventZFighting)

		// Move and scale plane mesh exactly like the squarified map
		planeMesh.scale.set(this.scaling.x / mapResolutionScaling, this.scaling.y / mapResolutionScaling, this.scaling.z)
		planeMesh.position.set(-this.mapSize * this.scaling.x, 0, -this.mapSize * this.scaling.z)

		this.floorLabelPlanes.push(planeMesh)
	}

	private getLabelAndSetContextFont(labelNode: Node, context: CanvasRenderingContext2D, mapResolutionScaling: number, fontSize: number) {
		const labelText = labelNode.name
		const floorWidth = labelNode.length * mapResolutionScaling

		context.font = `${fontSize}px Arial`

		const textMetrics = context.measureText(labelText)
		const fontScaleFactor = this.getFontScaleFactor(floorWidth, textMetrics.width)
		if (fontScaleFactor <= 0.5) {
			// Font will be to small.
			// So scale text not smaller than 0.5 and shorten it as well
			fontSize = fontSize * 0.5
			fontSize = Math.floor(Math.min(fontSize, labelNode.width * mapResolutionScaling))
			context.font = `${fontSize}px Arial`
			return {
				labelText: this.getFittingLabelText(context, floorWidth, labelText),
				fontSize
			}
		}
		fontSize = Math.floor(Math.min(fontSize * fontScaleFactor, labelNode.width * mapResolutionScaling))
		context.font = `${fontSize}px Arial`
		return { labelText, fontSize }
	}

	private getFontScaleFactor(canvasWidth: number, widthOfText: number) {
		return widthOfText < canvasWidth ? 1 : canvasWidth / widthOfText
	}

	private getFittingLabelText(context: CanvasRenderingContext2D, canvasWidth: number, labelText: string) {
		const { width } = context.measureText(labelText)
		let textSplitIndex = Math.floor((labelText.length * canvasWidth) / width)
		let abbreviatedText = `${labelText.slice(0, textSplitIndex)}…`

		// TODO: Check if this is expensive. If it is, let's use a logarithmic algorithm instead.
		// This is needed for non monospaced fonts, imagine the following example in a non monospaced font: "WWWIII"
		while (context.measureText(abbreviatedText).width >= canvasWidth && textSplitIndex > 1) {
			// textSplitIndex > 1 to ensure it contains at least one char
			textSplitIndex -= 1
			abbreviatedText = `${labelText.slice(0, textSplitIndex)}…`
		}

		return abbreviatedText
	}
}
