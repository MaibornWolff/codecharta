"use strict"

import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from "three"
import { Node, Scaling } from "../../../model/codeCharta.model"
import { getFloorLabelPadding } from "../algorithm/treeMapLayout/treeMapGenerator"
import { FloorLabelHelper } from "./floorLabelHelper"

interface FittedLabel {
    labelText: string
    fontSize: number
}

export class FloorLabelDrawer {
    // White glyphs on a transparent canvas fade to semi-transparent gray once mipmaps average
    // them with their transparent neighbors; a dark outline keeps the edges readable at distance.
    private static readonly LABEL_OUTLINE_COLOR = "rgba(0, 0, 0, 0.5)"
    private static readonly LABEL_OUTLINE_WIDTH_RATIO = 1 / 16
    private static readonly MIN_LABEL_OUTLINE_WIDTH = 2
    /** Every label is rasterized at this font size whatever the map or display, so a texture holds
     * one name at a fixed sharpness instead of the whole map at the display's resolution. */
    private static readonly TEXTURE_FONT_SIZE = 64
    private static readonly LINE_HEIGHT_RATIO = 1.3
    private static readonly LIFT_TO_PREVENT_Z_FIGHTING = 2
    private static readonly FONT_FAMILY = "Arial"

    private readonly floorLabelPlanes: Mesh[] = []
    private readonly floorLabelPlaneLevel = new Map<Mesh, number>()
    private readonly labelNodes: Node[]
    private readonly mapSize: number
    private readonly scaling: Vector3
    private readonly maxAnisotropy: number
    readonly folderGeometryHeight: number = 2.01

    constructor(nodes: Node[], rootNode: Node, mapSize: number, scaling: Vector3, experimentalFeaturesEnabled: boolean, maxAnisotropy = 1) {
        this.labelNodes = nodes.filter(node => FloorLabelHelper.isLabelNode(node))
        this.mapSize = mapSize
        this.scaling = scaling
        this.maxAnisotropy = maxAnisotropy
        this.folderGeometryHeight = experimentalFeaturesEnabled
            ? Math.ceil(2 / FloorLabelHelper.getMapResolutionScaling(rootNode.width)) * 2
            : 2.01
    }

    draw() {
        for (const labelNode of this.labelNodes) {
            const plane = this.drawLabel(labelNode)
            if (plane) {
                this.floorLabelPlanes.push(plane)
                this.floorLabelPlaneLevel.set(plane, labelNode.mapNodeDepth)
            }
        }
        return this.floorLabelPlanes
    }

    translatePlaneCanvases(scale: Scaling) {
        for (const plane of this.floorLabelPlanes) {
            plane.position.y = this.floorHeightOfLevel(this.floorLabelPlaneLevel.get(plane), scale.y)
        }
    }

    private floorHeightOfLevel(level: number, heightScaling: number) {
        return this.folderGeometryHeight * heightScaling * (level + 1) + FloorLabelDrawer.LIFT_TO_PREVENT_Z_FIGHTING
    }

    private drawLabel(labelNode: Node): Mesh | undefined {
        const pixelsPerMapUnit = FloorLabelDrawer.TEXTURE_FONT_SIZE / FloorLabelDrawer.fontSizeInMapUnits(labelNode)
        const textCanvas = document.createElement("canvas")
        const context = textCanvas.getContext("2d")
        const fitted = FloorLabelDrawer.getLabelAndSetContextFont(labelNode, context, pixelsPerMapUnit, FloorLabelDrawer.TEXTURE_FONT_SIZE)
        if (fitted.labelText.length === 0) {
            return undefined
        }
        const outlineWidth = Math.max(
            FloorLabelDrawer.MIN_LABEL_OUTLINE_WIDTH,
            fitted.fontSize * FloorLabelDrawer.LABEL_OUTLINE_WIDTH_RATIO
        )
        textCanvas.width = Math.ceil(context.measureText(fitted.labelText).width + 2 * outlineWidth)
        textCanvas.height = Math.ceil(fitted.fontSize * FloorLabelDrawer.LINE_HEIGHT_RATIO + 2 * outlineWidth)
        FloorLabelDrawer.writeLabelOnCanvas(context, textCanvas, fitted, outlineWidth)
        return this.createLabelPlane(textCanvas, labelNode, fitted.fontSize / pixelsPerMapUnit, pixelsPerMapUnit)
    }

    private static fontSizeInMapUnits(labelNode: Node) {
        // The label has to fit into the padding strip that the treemap layout reserved for it,
        // which is proportional to the folder itself (see getFloorLabelPadding).
        const reservedLabelStrip = getFloorLabelPadding(labelNode.width, labelNode.depth)
        const fontSize =
            labelNode.depth === 0 ? Math.max(Math.floor(labelNode.width * 0.03), 120) : Math.max(Math.floor(labelNode.width * 0.023), 95)
        return Math.max(Math.floor(Math.min(fontSize, reservedLabelStrip)), 1)
    }

    private static writeLabelOnCanvas(
        context: CanvasRenderingContext2D,
        textCanvas: HTMLCanvasElement,
        fitted: FittedLabel,
        outlineWidth: number
    ) {
        // Resizing a canvas resets its context, so every setting comes after the size.
        context.font = `${fitted.fontSize}px ${FloorLabelDrawer.FONT_FAMILY}`
        context.fillStyle = "white"
        context.strokeStyle = FloorLabelDrawer.LABEL_OUTLINE_COLOR
        context.lineJoin = "round"
        context.lineWidth = outlineWidth
        context.textAlign = "center"
        context.textBaseline = "middle"
        const centreX = textCanvas.width / 2
        const centreY = textCanvas.height / 2
        context.strokeText(fitted.labelText, centreX, centreY)
        context.fillText(fitted.labelText, centreX, centreY)
    }

    private createLabelPlane(textCanvas: HTMLCanvasElement, labelNode: Node, fontSizeInMapUnits: number, pixelsPerMapUnit: number) {
        const labelTexture = new CanvasTexture(textCanvas)
        // The label plane is viewed at a glancing angle; without anisotropic filtering the GPU
        // over-blurs the minified text along the view direction.
        labelTexture.anisotropy = this.maxAnisotropy

        const plane = new PlaneGeometry(textCanvas.width / pixelsPerMapUnit, textCanvas.height / pixelsPerMapUnit)
        const material = new MeshBasicMaterial({ map: labelTexture, transparent: true })
        const planeMesh = new Mesh(plane, material)

        // The label sits in the strip the layout reserved at the folder's far edge, centred along its length.
        const centreX = labelNode.x0 + labelNode.width - fontSizeInMapUnits / 2
        const centreZ = labelNode.y0 + labelNode.length / 2
        planeMesh.position.set(
            this.scaling.x * (centreX - this.mapSize),
            this.floorHeightOfLevel(labelNode.mapNodeDepth, this.scaling.y),
            this.scaling.z * (centreZ - this.mapSize)
        )
        planeMesh.rotation.set(-Math.PI / 2, 0, Math.PI / 2)
        planeMesh.scale.set(this.scaling.z, this.scaling.x, 1)
        return planeMesh
    }

    private static getLabelAndSetContextFont(
        labelNode: Node,
        context: CanvasRenderingContext2D,
        pixelsPerMapUnit: number,
        fontSize: number
    ): FittedLabel {
        const labelText = labelNode.name
        const floorWidth = labelNode.length * pixelsPerMapUnit

        context.font = `${fontSize}px ${FloorLabelDrawer.FONT_FAMILY}`

        const textMetrics = context.measureText(labelText)
        const fontScaleFactor = FloorLabelDrawer.getFontScaleFactor(floorWidth, textMetrics.width)
        if (fontScaleFactor <= 0.5) {
            // Font will be to small.
            // So scale text not smaller than 0.5 and shorten it as well
            fontSize = fontSize * 0.5
            fontSize = Math.floor(Math.min(fontSize, labelNode.width * pixelsPerMapUnit))
            context.font = `${fontSize}px ${FloorLabelDrawer.FONT_FAMILY}`
            return {
                labelText: FloorLabelDrawer.getFittingLabelText(context, floorWidth, labelText),
                fontSize
            }
        }
        fontSize = Math.floor(Math.min(fontSize * fontScaleFactor, labelNode.width * pixelsPerMapUnit))
        context.font = `${fontSize}px ${FloorLabelDrawer.FONT_FAMILY}`
        return { labelText, fontSize }
    }

    private static getFontScaleFactor(canvasWidth: number, widthOfText: number) {
        return widthOfText < canvasWidth ? 1 : canvasWidth / widthOfText
    }

    private static getFittingLabelText(context: CanvasRenderingContext2D, canvasWidth: number, labelText: string) {
        const { width } = context.measureText(labelText)
        let textSplitIndex = Math.floor((labelText.length * canvasWidth) / width)
        let abbreviatedText = `${labelText.slice(0, textSplitIndex)}…`

        // This is needed for non monospaced fonts, imagine the following example in a non monospaced font: "WWWIII"
        while (context.measureText(abbreviatedText).width >= canvasWidth && textSplitIndex > 1) {
            // textSplitIndex > 1 to ensure it contains at least one char
            textSplitIndex -= 1
            abbreviatedText = `${labelText.slice(0, textSplitIndex)}…`
        }

        return abbreviatedText
    }
}
