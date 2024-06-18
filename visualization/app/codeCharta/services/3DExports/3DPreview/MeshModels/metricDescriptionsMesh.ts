import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"
import { Box3, Font, Mesh, MeshBasicMaterial } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"
import { SizeChangeScaleStrategy } from "../SizeChangeStrategies/sizeChangeScaleStrategy"
import { MetricDescriptionBlockMesh } from "./metricDescriptionBlockMesh"
import { ColorMetricDescriptionBlockMesh } from "./colorMetricDescriptionBlockMesh"

export class MetricDescriptionsMesh extends ManualVisibilityMesh {
    constructor(public font: Font) {
        super(new SizeChangeScaleStrategy(), new DefaultPrintColorChangeStrategy(), 1, true, 2)
        this.name = "MetricDescriptions"
    }

    async init(geometryOptions: GeometryOptions): Promise<MetricDescriptionsMesh> {
        this.material = new MeshBasicMaterial()

        const { areaIcon, areaIconScale } = this.createAreaAttributes()
        const { heightIcon, heightIconScale } = this.createHeightAttributes()
        const { colorIcon, colorIconScale } = this.createColorAttributes()

        const heightMetricBlock = await new MetricDescriptionBlockMesh(
            {
                name: "heigth",
                title: geometryOptions.heightMetricTitle,
                iconFilename: heightIcon,
                iconScale: heightIconScale,
                nodeMetricData: geometryOptions.heightMetricData
            },
            this.font,
            30
        ).init(geometryOptions)
        this.add(heightMetricBlock)

        const areaMetricBlock = await new MetricDescriptionBlockMesh(
            {
                name: "area",
                title: geometryOptions.areaMetricTitle,
                iconFilename: areaIcon,
                iconScale: areaIconScale,
                nodeMetricData: geometryOptions.areaMetricData
            },
            this.font,
            0
        ).init(geometryOptions)
        this.add(areaMetricBlock)

        const colorMetricBlock = await new ColorMetricDescriptionBlockMesh(
            {
                name: "color",
                title: geometryOptions.colorMetricTitle,
                iconFilename: colorIcon,
                iconScale: colorIconScale,
                nodeMetricData: geometryOptions.colorMetricData,
                colorRange: geometryOptions.colorRange
            },
            this.font,
            -30
        ).init(geometryOptions)
        this.add(colorMetricBlock)

        const scaleFactor = (200 * geometryOptions.width) / (geometryOptions.width - geometryOptions.mapSideOffset * 2)
        this.changeSize(geometryOptions, scaleFactor)
        if (this.visible) {
            this.xCenterMetricsMesh(this)
        }
        return this
    }

    private xCenterMetricsMesh(metricsMesh: Mesh) {
        //compute bounding box of the mesh and center it in the x direction
        let boundingBox = new Box3()
        metricsMesh.traverse(child => {
            if (child instanceof Mesh) {
                child.geometry.computeBoundingBox()
                boundingBox = boundingBox.union(child.geometry.boundingBox)
            }
        })
        metricsMesh.position.x = (Math.abs(boundingBox.max.x - boundingBox.min.x) * metricsMesh.scale.x) / 2
    }

    private createColorAttributes() {
        const colorIcon = "color_icon_for_3D_print.svg"
        const colorIconScale = 10
        return { colorIcon, colorIconScale }
    }

    private createHeightAttributes() {
        const heightIcon = "height_icon_for_3D_print.svg"
        const heightIconScale = 12
        return { heightIcon, heightIconScale }
    }

    private createAreaAttributes() {
        const areaIcon = "area_icon_for_3D_print.svg"
        const areaIconScale = 10
        return { areaIcon, areaIconScale }
    }
}
