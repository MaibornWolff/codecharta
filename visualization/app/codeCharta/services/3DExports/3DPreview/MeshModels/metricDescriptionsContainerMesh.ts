import { CustomVisibilityMesh } from "./customVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"
import { Font, Mesh } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"
import { MetricDescriptionBlockMesh } from "./metricDescriptionBlockMesh"
import { ColorMetricDescriptionBlockMesh } from "./colorMetricDescriptionBlockMesh"

export class MetricDescriptionsContainerMesh extends CustomVisibilityMesh {
    constructor(
        name: string,
        public font: Font
    ) {
        super(name, new DefaultPrintColorChangeStrategy(), 1, true, 2)
    }

    async init(geometryOptions: GeometryOptions): Promise<MetricDescriptionsContainerMesh> {
        const { areaIcon, areaIconScale } = this.createAreaAttributes()
        const { heightIcon, heightIconScale } = this.createHeightAttributes()
        const { colorIcon, colorIconScale } = this.createColorAttributes()

        const heightMetricBlock = await new MetricDescriptionBlockMesh(
            {
                name: "HeigthMetricBlock",
                title: geometryOptions.heightMetricTitle,
                iconFilename: heightIcon,
                iconScale: heightIconScale,
                nodeMetricData: geometryOptions.heightMetricData
            },
            this.font,
            0.05
        ).init(geometryOptions)
        this.add(heightMetricBlock)

        const areaMetricBlock = await new MetricDescriptionBlockMesh(
            {
                name: "AreaMetricBlock",
                title: geometryOptions.areaMetricTitle,
                iconFilename: areaIcon,
                iconScale: areaIconScale,
                nodeMetricData: geometryOptions.areaMetricData
            },
            this.font,
            -0.1
        ).init(geometryOptions)
        this.add(areaMetricBlock)

        const colorMetricBlock = await new ColorMetricDescriptionBlockMesh(
            {
                name: "ColorMetricBlock",
                title: geometryOptions.colorMetricTitle,
                iconFilename: colorIcon,
                iconScale: colorIconScale,
                nodeMetricData: geometryOptions.colorMetricData,
                colorRange: geometryOptions.colorRange
            },
            this.font,
            -0.25
        ).init(geometryOptions)
        this.add(colorMetricBlock)

        this.centerMetricsMeshInXDirection()

        return this
    }

    private centerMetricsMeshInXDirection() {
        const x = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }
        this.traverse(child => {
            if (child instanceof Mesh && child.visible) {
                child.geometry.computeBoundingBox()
                const { min, max } = child.geometry.boundingBox
                x.min = Math.min(x.min, min.x)
                x.max = Math.max(x.max, max.x)
            }
        })
        this.position.x = (x.max - x.min) / 2
    }

    private createColorAttributes() {
        const colorIcon = "color_icon_for_3D_print.svg"
        const colorIconScale = 0.075
        return { colorIcon, colorIconScale }
    }

    private createHeightAttributes() {
        const heightIcon = "height_icon_for_3D_print.svg"
        const heightIconScale = 0.09
        return { heightIcon, heightIconScale }
    }

    private createAreaAttributes() {
        const areaIcon = "area_icon_for_3D_print.svg"
        const areaIconScale = 0.075
        return { areaIcon, areaIconScale }
    }
}
