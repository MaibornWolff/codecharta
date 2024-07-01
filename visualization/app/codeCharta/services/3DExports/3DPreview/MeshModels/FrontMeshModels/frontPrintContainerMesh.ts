import { GeometryOptions } from "../../preview3DPrintMesh"
import { GeneralMesh, GeneralSizeChangeMesh } from "../generalMesh"
import { BackPrintColorChangeStrategy } from "../../ColorChangeStrategies/backPrintColorChangeStrategy"
import { Font } from "three"
import { FrontTextMesh } from "./frontTextMesh"
import { SecondRowTextMesh } from "./secondRowTextMesh"
import { FrontMWLogoMesh } from "./frontMWLogoMesh"
import { CustomLogoMesh } from "./customLogoMesh"
import { FrontLogo } from "./frontLogo"

export class FrontPrintContainerMesh extends GeneralMesh implements GeneralSizeChangeMesh {
    private childrenMeshes: Map<string, GeneralMesh>

    constructor(private font: Font) {
        const colorChangeStrategy = new BackPrintColorChangeStrategy()
        super("FrontPrintContainer", colorChangeStrategy)
    }

    async init(geometryOptions: GeometryOptions): Promise<FrontPrintContainerMesh> {
        this.childrenMeshes = new Map<string, GeneralMesh>()
        this.childrenMeshes.set("FrontText", new FrontTextMesh("FrontText", this.font, geometryOptions))
        this.childrenMeshes.set("SecondRowText", new SecondRowTextMesh("SecondRowText", this.font, geometryOptions))
        this.childrenMeshes.set("FrontMWLogo", new FrontMWLogoMesh("FrontMWLogo"))

        await Promise.all(
            [...this.childrenMeshes.values()].map(async mesh => {
                await mesh.init(geometryOptions)
                this.add(mesh)
            })
        )

        this.position.y = -geometryOptions.width / 2 - geometryOptions.mapSideOffset / 2

        return this
    }

    async addCustomLogo(dataUrl: string, geometryOptions: GeometryOptions): Promise<void> {
        if (this.childrenMeshes.has("CustomLogo")) {
            this.removeCustomLogo()
        }
        const customLogoMesh = await new CustomLogoMesh("CustomLogo", dataUrl).init(geometryOptions)
        this.add(customLogoMesh)
        this.childrenMeshes.set(customLogoMesh.name, customLogoMesh)
    }

    rotateCustomLogo() {
        const customLogoMesh = this.childrenMeshes.get("CustomLogo") as CustomLogoMesh
        customLogoMesh.rotate()
    }

    flipCustomLogo() {
        const customLogoMesh = this.childrenMeshes.get("CustomLogo") as CustomLogoMesh
        customLogoMesh.flip()
    }

    removeCustomLogo() {
        this.remove(this.childrenMeshes.get("CustomLogo"))
        this.childrenMeshes.delete("CustomLogo")
    }

    updateCustomLogoColor(newColor: string) {
        const customLogoMesh = this.childrenMeshes.get("CustomLogo") as CustomLogoMesh
        customLogoMesh.setColor(newColor)
    }

    async updateFrontText(frontText: string, geometryOptions: GeometryOptions) {
        const frontTextMesh = this.childrenMeshes.get("FrontText") as FrontTextMesh
        frontTextMesh.updateTextGeometryOptions(frontText)
        await frontTextMesh.updateText(geometryOptions)
    }

    changeSize(geometryOptions: GeometryOptions, oldWidth: number): void {
        this.position.y -= (geometryOptions.width - oldWidth) / 2
        for (const mesh of this.childrenMeshes.values()) {
            if (mesh instanceof FrontLogo && mesh.isGeneralSizeChangeMesh()) {
                mesh.changeSize(geometryOptions, oldWidth)
            }
        }
    }

    async updateSecondRowText(secondRowText: string, geometryOptions: GeometryOptions) {
        const secondRowTextMesh = this.childrenMeshes.get("SecondRowText") as SecondRowTextMesh
        secondRowTextMesh.updateTextGeometryOptions(secondRowText)
        await secondRowTextMesh.updateText(geometryOptions)
    }

    updateSecondRowVisibility(geometryOptions: GeometryOptions) {
        const frontMWLogoMesh = this.childrenMeshes.get("FrontMWLogo") as FrontMWLogoMesh
        const secondRowMesh = this.childrenMeshes.get("SecondRowText") as SecondRowTextMesh
        const customLogoMesh = this.childrenMeshes.get("CustomLogo") as CustomLogoMesh

        secondRowMesh.setManualVisibility(geometryOptions.secondRowVisible)

        frontMWLogoMesh.changeRelativeSize(geometryOptions)
        customLogoMesh?.changeRelativeSize(geometryOptions)
    }
}
