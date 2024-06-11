import { Mesh, MeshBasicMaterial, ShaderMaterial } from "three"
import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { CreateGeometryStrategy } from "./CreateGeometryStrategies/createGeometryStrategy"
import { SizeChangeStrategy } from "./SizeChangeStrategies/sizeChangeStrategy"
import { GeometryOptions } from "./preview3DPrintMesh"

export abstract class GeneralMesh extends Mesh {
    boundingBoxCalculated = false

    constructor(public createGeometryStrategy: CreateGeometryStrategy, public sizeChangeStrategy: SizeChangeStrategy) {
        super()
    }

    abstract init(geometryOptions: GeometryOptions): void
    abstract changeSize(geometryOptions: GeometryOptions, oldWidth: number): Promise<void>;

    getWidth(): number {
        this.updateBoundingBox()
        return this.geometry.boundingBox.max.x - this.geometry.boundingBox.min.x
    }
    getHeight(): number {
        this.updateBoundingBox()
        return this.geometry.boundingBox.max.z - this.geometry.boundingBox.min.z
    }
    getDepth(): number {
        this.updateBoundingBox()
        return this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y
    }
    private updateBoundingBox() {
        if (!this.boundingBoxCalculated) {
            this.geometry.computeBoundingBox()
            this.boundingBoxCalculated = true
        }
    }

    changeColor(numberOfColors: number) {
        if (this instanceof ManualVisibilityMesh) {
            this.updateVisibilityBecauseOfColor(numberOfColors)
        }

        if (this.material instanceof MeshBasicMaterial) {
            const colorArray = this.getColorArray(this.name, numberOfColors)
            this.material.color.setRGB(colorArray[0], colorArray[1], colorArray[2])
        } else if (this.material instanceof ShaderMaterial) {
            this.material.defaultAttributeValues.color = this.getColorArray(this.name, numberOfColors)
        }
    }

    private getColorArray(partName: string, numberOfColors: number): number[] {
        const getBuildingColor = () => (numberOfColors < 4 ? [1, 1, 1] : [0, 1, 0])
        const getNeutralBuildingColor = () => (numberOfColors < 4 ? [1, 1, 1] : [1, 1, 0])
        const getNegativeBuildingColor = () => (numberOfColors < 4 ? [1, 1, 1] : [1, 0, 0])
        const getBaseplateColor = () => {
            if (numberOfColors === 1) {
                return [1, 1, 1]
            }
            return [0.5, 0.5, 0.5]
        }
        const getFrontPrintAndLogoColor = () => {
            if (numberOfColors < 4) {
                return [1, 1, 1]
            }
            if (numberOfColors === 4) {
                return [1, 1, 0]
            }
            return [1, 1, 1]
        }
        const getBackTextAndLogoColor = () => {
            if (numberOfColors === 1) {
                return [0, 0, 1]
            }
            if (numberOfColors < 4) {
                return [1, 1, 1]
            }
            if (numberOfColors === 4) {
                return [1, 1, 0]
            }
            return [1, 1, 1]
        }
        const getMetricColorTextColor = (colorWhenMoreThan3: number[]) => {
            if (numberOfColors < 4) {
                return [0, 0, 1]
            }
            return colorWhenMoreThan3
        }

        const colorFunctions = {
            "Positive Building": getBuildingColor,
            "Neutral Building": getNeutralBuildingColor,
            "Negative Building": getNegativeBuildingColor,
            Baseplate: getBaseplateColor,
            Area: getBaseplateColor,
            "Front MW Logo": getFrontPrintAndLogoColor,
            "Front Text": getFrontPrintAndLogoColor,
            "Second Row Text": getFrontPrintAndLogoColor,
            "Back MW Logo": getBackTextAndLogoColor,
            "ITS Text": getBackTextAndLogoColor,
            "CodeCharta Logo": getBackTextAndLogoColor,
            "Metric Text": getBackTextAndLogoColor,
            "Metric Text Part 0": getBackTextAndLogoColor,
            "Metric Text Part 1": () => getMetricColorTextColor([0, 1, 0]),
            "Metric Text Part 2": getBackTextAndLogoColor,
            "Metric Text Part 3": () => getMetricColorTextColor([1, 1, 0]),
            "Metric Text Part 4": getBackTextAndLogoColor,
            "Metric Text Part 5": () => getMetricColorTextColor([1, 0, 0]),
            QrCode: getBackTextAndLogoColor
        }

        if (partName in colorFunctions) {
            return colorFunctions[partName]()
        }
        console.warn("Unknown object:", partName, "Did you forget to add it to colorFunctions in the getColorArray method?")
        return [0, 1, 1]
    }
}
