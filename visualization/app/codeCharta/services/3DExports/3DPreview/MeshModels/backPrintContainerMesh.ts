import { GeometryOptions } from "../preview3DPrintMesh"
import { GeneralMesh, GeneralSizeChangeMesh } from "./generalMesh"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"
import { BackMWLogoMesh } from "./backMWLogoMesh"
import { BackBelowLogoTextMesh } from "./backBelowLogoTextMesh"
import { QrCodeMesh } from "./qrCodeMesh"
import { CodeChartaLogoMesh } from "./codeChartaLogoMesh"
import { CodeChartaTextMesh } from "./codeChartaTextMesh"
import { MetricDescriptionsContainerMesh } from "./metricDescriptionsContainerMesh"
import { Font } from "three"

export class BackPrintContainerMesh extends GeneralMesh implements GeneralSizeChangeMesh {
    private childrenMeshes: Map<string, GeneralMesh>

    constructor(private font: Font) {
        const colorChangeStrategy = new DefaultPrintColorChangeStrategy()
        super("BackPrintContainer", colorChangeStrategy)
    }

    async init(geometryOptions: GeometryOptions): Promise<BackPrintContainerMesh> {
        this.childrenMeshes = new Map<string, GeneralMesh>()
        this.childrenMeshes.set("BackMWLogo", new BackMWLogoMesh("BackMWLogo"))
        this.childrenMeshes.set("BackBelowLogoText", new BackBelowLogoTextMesh("BackBelowLogoText", this.font, geometryOptions))
        this.childrenMeshes.set("QrCode", new QrCodeMesh("QrCode"))
        this.childrenMeshes.set("CodeChartaLogo", new CodeChartaLogoMesh("CodeChartaLogo"))
        this.childrenMeshes.set("CodeChartaText", new CodeChartaTextMesh("CodeChartaText", this.font, geometryOptions))
        this.childrenMeshes.set("MetricDescriptions", new MetricDescriptionsContainerMesh("MetricDescriptions", this.font))

        await Promise.all(
            [...this.childrenMeshes.values()].map(async mesh => {
                await mesh.init(geometryOptions)
                this.add(mesh)
            })
        )

        return this
    }

    async changeSize(geometryOptions: GeometryOptions, oldWidth: number): Promise<void> {
        const scaleFactor = geometryOptions.width / oldWidth
        this.scale.set(this.scale.x * scaleFactor, this.scale.y * scaleFactor, this.scale.z)
    }

    isQRCodeVisible(): boolean {
        return this.childrenMeshes.get("QrCode").visible
    }

    async updateQrCodeText(qrCodeText: string, geometryOptions: GeometryOptions): Promise<void> {
        geometryOptions.qrCodeText = qrCodeText
        const qrCodeMesh = this.childrenMeshes.get("QrCode") as QrCodeMesh
        qrCodeMesh.changeText(geometryOptions)
    }

    updateQrCodeVisibility(qrCodeVisible: boolean) {
        const qrCodeMesh = this.childrenMeshes.get("QrCode") as QrCodeMesh
        qrCodeMesh.setManualVisibility(qrCodeVisible)
    }
}
