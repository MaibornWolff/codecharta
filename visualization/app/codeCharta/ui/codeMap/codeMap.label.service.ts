import { Sprite, Vector3, Box3, Sphere, LineBasicMaterial, Line, BufferGeometry, LinearFilter, Texture, SpriteMaterial, Color } from "three"
import { LayoutAlgorithm, Node, CcState } from "../../codeCharta.model"
import { ThreeOrbitControlsService } from "./threeViewer/threeOrbitControls.service"
import { ThreeCameraService } from "./threeViewer/threeCamera.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { ColorConverter } from "../../util/color/colorConverter"
import { Injectable } from "@angular/core"
import { treeMapSize } from "../../util/algorithm/treeMapLayout/treeMapHelper"
import { State } from "@ngrx/store"
import { defaultMapColors } from "../../state/store/appSettings/mapColors/mapColors.reducer"

interface InternalLabel {
    sprite: Sprite
    line: Line | null
    heightValue: number
    lineCount: number
    node: Node
}

@Injectable({ providedIn: "root" })
export class CodeMapLabelService {
    private labels: InternalLabel[]
    private mapLabelColors = defaultMapColors.labelColorAndAlpha
    private LABEL_COLOR_RGB = ColorConverter.convertHexToRgba(this.mapLabelColors.rgb)
    private LABEL_WIDTH_DIVISOR = 2100 // empirically gathered
    private LABEL_HEIGHT_DIVISOR = 35 // empirically gathered
    private LABEL_CORNER_RADIUS = 40 //empirically gathered
    private LABEL_SCALE_FACTOR = 0.7 //empirically gathered
    private LABEL_HEIGHT_COEFFICIENT = 15 / 4 //empirically gathered, needed to prevent label collision with building with higher margin, TODO scale with margin factor once its available
    private LABEL_HEIGHT_POSITION = 60

    private previousScaling: Vector3 = new Vector3(1, 1, 1)
    private lineCount = 1
    private nodeHeight = 0

    constructor(
        private state: State<CcState>,
        private threeCameraService: ThreeCameraService,
        private threeSceneService: ThreeSceneService,
        private threeOrbitControlsService: ThreeOrbitControlsService
    ) {
        this.labels = new Array<InternalLabel>()
        this.threeOrbitControlsService.subscribe("onCameraChanged", () => this.onCameraChanged())
    }

    // Labels need to be scaled according to map or it will clip + looks bad
    addLeafLabel(node: Node, highestNodeInSet: number, enforceLabel = false) {
        const { appSettings, dynamicSettings } = this.state.getValue()

        const { scaling, layoutAlgorithm, showMetricLabelNodeName, showMetricLabelNameValue } = appSettings
        const { margin, heightMetric } = dynamicSettings
        const multiplier = new Vector3(scaling.x, scaling.y, scaling.z)

        let labelText = ""

        if (showMetricLabelNodeName || (enforceLabel && !showMetricLabelNameValue)) {
            labelText = `${node.name}`
        } else if (!showMetricLabelNameValue) {
            return
        }

        if (showMetricLabelNameValue) {
            if (labelText !== "") {
                labelText += "\n"
            }
            labelText += `${node.attributes[heightMetric]} ${heightMetric}`
        }

        const label = this.makeText(labelText, 30, node)

        let newHighestNode = node.height + Math.abs(node.heightDelta ?? 0)
        newHighestNode = newHighestNode * multiplier.y > highestNodeInSet * multiplier.y ? newHighestNode : highestNodeInSet

        this.nodeHeight = this.nodeHeight > newHighestNode ? this.nodeHeight : newHighestNode
        // todo: tk rename to addLeafLabel

        const x = node.x0 - treeMapSize
        const y = node.z0
        const z = node.y0 - treeMapSize

        const labelX = (x + node.width / 2) * multiplier.x
        const labelY = (y + this.nodeHeight) * multiplier.y
        const labelYOrigin = (y + node.height) * multiplier.y
        const labelZ = (z + node.length / 2) * multiplier.z

        const labelHeightScaled = this.LABEL_HEIGHT_COEFFICIENT * margin * this.LABEL_SCALE_FACTOR
        let labelOffset = labelHeightScaled + label.heightValue / 2

        switch (layoutAlgorithm) {
            // !remark : algorithm scaling is not same as the squarified layout,
            // !layout offset needs to be scaled down,the divided by value is just empirical,
            // TODO !needs further investigation
            case LayoutAlgorithm.StreetMap:
            case LayoutAlgorithm.TreeMapStreet:
                labelOffset /= 10
                this.LABEL_HEIGHT_POSITION = 0
                label.line = this.makeLine(labelX, labelY + labelOffset, labelYOrigin, labelZ)
                break
            default:
                label.line = this.makeLine(labelX, labelY + labelHeightScaled / 2, labelYOrigin, labelZ)
        }

        label.sprite.position.set(labelX, labelY + labelOffset, labelZ) //label_height

        label.sprite.material.color = new Color(this.mapLabelColors.rgb)
        label.sprite.material.opacity = this.mapLabelColors.alpha
        label.sprite.userData = { node }

        this.threeSceneService.labels.add(label.sprite)
        this.threeSceneService.labels.add(label.line)

        this.labels.push(label) // todo tk: why is the duplication of this.labels and threeSceneService.labels needed? To sync label.sprite with label.line I guess - is there maybe a nicer solution for that?
    }

    clearLabels() {
        this.threeSceneService.resetLabel()
        this.threeSceneService.resetLineHighlight()
        this.dispose(this.labels)

        this.labels = []
        this.nodeHeight = 0
        this.LABEL_HEIGHT_POSITION = 60

        // Reset the children
        this.dispose(this.threeSceneService.labels.children)
        this.threeSceneService.labels.children = []
    }

    private disposeSprite(element: Sprite) {
        element.material.dispose()
        element.material.map.dispose()
        element.geometry.dispose()
    }

    private disposeLine(element: Line) {
        const lineBasicMaterial = element.material as unknown as LineBasicMaterial
        lineBasicMaterial.dispose()
        element.geometry.dispose()
    }

    dispose(labels) {
        for (const element of labels) {
            if (element instanceof Sprite) {
                this.disposeSprite(element)
            }
            if (element instanceof Line) {
                this.disposeLine(element)
            }

            if (element.sprite !== undefined) {
                this.disposeSprite(element.sprite)
            }

            if (element.line !== undefined) {
                this.disposeLine(element.line)
            }
        }
    }

    clearTemporaryLabel(hoveredNode: Node) {
        const index = this.labels.findIndex(({ node }) => node === hoveredNode)
        if (index > -1) {
            this.labels.splice(index, 1)
            this.dispose(this.threeSceneService.labels.children)
            this.threeSceneService.labels.children.length -= 2
            this.threeSceneService.resetLineHighlight()
        }
    }

    scale() {
        const { scaling } = this.state.getValue().appSettings
        const scalingVector = new Vector3(scaling.x, scaling.y, scaling.z)
        const { margin } = this.state.getValue().dynamicSettings

        const labelHeightDifference = new Vector3(0, this.LABEL_HEIGHT_COEFFICIENT * margin * this.LABEL_SCALE_FACTOR, 0)

        for (const label of this.labels) {
            const multiplier = scalingVector.clone()

            label.sprite.position.sub(labelHeightDifference).divide(this.previousScaling).multiply(multiplier).add(labelHeightDifference)
            if (multiplier.y > 1) {
                multiplier.y = 1
            }
            // Attribute vertices does exist on geometry but it is missing in the mapping file for TypeScript.
            const lineGeometry = label.line.geometry as BufferGeometry
            const lineGeometryPosition = lineGeometry.attributes.position

            // Position save, then clear and redraw?

            lineGeometryPosition.setX(0, lineGeometryPosition.getX(0) * multiplier.x)
            lineGeometryPosition.setY(0, lineGeometryPosition.getY(0) * multiplier.y)
            lineGeometryPosition.setZ(0, lineGeometryPosition.getZ(0) * multiplier.z)

            lineGeometryPosition.setX(1, label.sprite.position.x)
            lineGeometryPosition.setY(1, label.sprite.position.y)
            lineGeometryPosition.setZ(1, label.sprite.position.z)

            lineGeometryPosition.needsUpdate = true
        }

        this.previousScaling.copy(scalingVector)
    }

    onCameraChanged() {
        for (const label of this.labels) {
            this.setLabelSize(label.sprite, label, label.sprite.material.map.image.width)
        }
    }

    private makeText(message: string, fontsize: number, node: Node): InternalLabel {
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")

        context.font = `${fontsize}px Roboto`

        const margin = 25
        const multiLineContext = message.split("\n")

        // setting canvas width/height before ctx draw, else canvas is empty
        const firstMultiLineContextWidth = context.measureText(multiLineContext[0]).width
        const secondMultiLineContextWidth = context.measureText(multiLineContext[1]).width
        canvas.width =
            firstMultiLineContextWidth > secondMultiLineContextWidth
                ? firstMultiLineContextWidth + margin
                : secondMultiLineContextWidth + margin
        canvas.height = margin + fontsize * multiLineContext.length

        // bg
        context.font = `${fontsize}px Roboto`
        context.fillStyle = "rgba(255,255,255,1)"
        context.lineJoin = "round"
        context.lineCap = "round"
        context.lineWidth = 5

        CodeMapLabelService.drawRectangleWithRoundedCorners(context, 0, 0, canvas.width, canvas.height, this.LABEL_CORNER_RADIUS)

        // after setting the canvas width/height we have to re-set font to apply!?! looks like ctx reset
        context.fillStyle = "rgba(0,0,0,1)"
        context.textAlign = "center"
        context.textBaseline = "middle"

        //fillText() cannot create multi-line texts, we call it multiple times with different offsets to create a multi-line label
        for (const [index, element] of multiLineContext.entries()) {
            context.fillText(element, canvas.width / 2, (canvas.height * (index + 1)) / (multiLineContext.length + 1))
        }

        const texture = new Texture(canvas)
        texture.minFilter = LinearFilter // NearestFilter;
        texture.needsUpdate = true

        const spriteMaterial = new SpriteMaterial({ map: texture })
        const sprite = new Sprite(spriteMaterial)
        this.lineCount = multiLineContext.length
        this.setLabelSize(sprite, null, canvas.width)

        return {
            sprite,
            heightValue: canvas.height,
            line: null,
            lineCount: multiLineContext.length,
            node
        }
    }

    private static drawRectangleWithRoundedCorners(context, x, y, width, height, radius) {
        if (width < 2 * radius) {
            radius = width / 2
        }
        if (height < 2 * radius) {
            radius = height / 2
        }
        context.beginPath()

        context.moveTo(x + radius, y)
        context.arcTo(x + width, y, x + width, y + height, radius)
        context.arcTo(x + width, y + height, x, y + height, radius)
        context.arcTo(x, y + height, x, y, radius)
        context.arcTo(x, y, x + width, y, radius)

        context.closePath()
        context.fill()
    }

    private setLabelSize(sprite: Sprite, label: InternalLabel, labelWidth: number = sprite.material.map.image.width) {
        const mapCenter = new Box3().setFromObject(this.threeSceneService.mapGeometry).getBoundingSphere(new Sphere()).center
        if (this.threeCameraService.camera) {
            const distance = this.threeCameraService.camera.position.distanceTo(mapCenter)
            if (label !== null) {
                this.lineCount = label.lineCount
            }
            if (this.lineCount > 1) {
                sprite.scale.set((distance / this.LABEL_WIDTH_DIVISOR) * labelWidth, distance / 25, 1)
            } else {
                sprite.scale.set((distance / this.LABEL_WIDTH_DIVISOR) * labelWidth, distance / this.LABEL_HEIGHT_DIVISOR, 1)
            }
        }
    }

    private makeLine(x: number, y: number, yOrigin: number, z: number) {
        const material = new LineBasicMaterial({
            color: this.LABEL_COLOR_RGB,
            linewidth: 2
        })

        const bufferGeometry = new BufferGeometry().setFromPoints([
            new Vector3(x, yOrigin, z),
            new Vector3(x, y + this.LABEL_HEIGHT_POSITION, z)
        ])

        return new Line(bufferGeometry, material)
    }
}
