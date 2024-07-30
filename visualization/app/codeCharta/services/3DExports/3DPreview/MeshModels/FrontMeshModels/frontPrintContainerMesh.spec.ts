import { Font } from "three"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { FrontPrintContainerMesh } from "./frontPrintContainerMesh"
import { FrontTextMesh } from "./frontTextMesh"
import { SecondRowTextMesh } from "./secondRowTextMesh"
import { FrontMWLogoMesh } from "./frontMWLogoMesh"
import { CustomLogoMesh } from "./customLogoMesh"

jest.mock("./frontTextMesh", () => {
    return {
        FrontTextMesh: jest.fn().mockImplementation(function (this: any) {
            this.init = jest.fn().mockResolvedValue(undefined)
            this.add = jest.fn()
            this.remove = jest.fn()
            this.updateText = jest.fn().mockResolvedValue(undefined)
            this.updateTextGeometryOptions = jest.fn()
            this.visible = true
        })
    }
})

jest.mock("./secondRowTextMesh", () => {
    return {
        SecondRowTextMesh: jest.fn().mockImplementation(function (this: any) {
            this.init = jest.fn().mockResolvedValue(undefined)
            this.add = jest.fn()
            this.remove = jest.fn()
            this.updateText = jest.fn().mockResolvedValue(undefined)
            this.updateTextGeometryOptions = jest.fn()
            this.setManualVisibility = jest.fn()
            this.visible = true
        })
    }
})

jest.mock("./frontMWLogoMesh", () => {
    return {
        FrontMWLogoMesh: jest.fn().mockImplementation(function (this: any) {
            this.init = jest.fn().mockResolvedValue(undefined)
            this.add = jest.fn()
            this.remove = jest.fn()
            this.changeRelativeSize = jest.fn()
            this.visible = true
        })
    }
})

jest.mock("./customLogoMesh", () => {
    return {
        CustomLogoMesh: jest.fn().mockImplementation(function (this: any) {
            this.init = jest.fn().mockResolvedValue(this)
            this.add = jest.fn()
            this.remove = jest.fn()
            this.rotate = jest.fn()
            this.flip = jest.fn()
            this.setColor = jest.fn()
            this.changeRelativeSize = jest.fn()
            this.visible = true
        })
    }
})

describe("FrontPrintContainerMesh", () => {
    let font: Font
    let geometryOptions: GeometryOptions

    beforeEach(() => {
        font = new Font(font)
        geometryOptions = {
            width: 100,
            printHeight: 10,
            baseplateHeight: 20,
            mapSideOffset: 30,
            qrCodeText: "qrCodeText",
            secondRowVisible: true
        } as GeometryOptions
    })

    it("should initialize all children meshes and add them to the container", async () => {
        const frontPrintContainerMesh = new FrontPrintContainerMesh(font)
        await frontPrintContainerMesh.init(geometryOptions)

        const childrenMeshes = frontPrintContainerMesh.getChildrenMeshes()
        expect(childrenMeshes.size).toBe(3)
        expect(childrenMeshes.get("FrontText")).toBeInstanceOf(FrontTextMesh)
        expect(childrenMeshes.get("SecondRowText")).toBeInstanceOf(SecondRowTextMesh)
        expect(childrenMeshes.get("FrontMWLogo")).toBeInstanceOf(FrontMWLogoMesh)
    })

    it("should update the front text", async () => {
        const frontPrintContainerMesh = new FrontPrintContainerMesh(font)
        await frontPrintContainerMesh.init(geometryOptions)

        const newText = "NewFrontText"
        await frontPrintContainerMesh.updateFrontText(newText, geometryOptions)

        const frontTextMesh = frontPrintContainerMesh.getChildrenMeshes().get("FrontText") as FrontTextMesh
        expect(frontTextMesh.updateTextGeometryOptions).toHaveBeenCalledWith(newText)
        expect(frontTextMesh.updateText).toHaveBeenCalledWith(geometryOptions)
    })

    it("should update the second row text", async () => {
        const frontPrintContainerMesh = new FrontPrintContainerMesh(font)
        await frontPrintContainerMesh.init(geometryOptions)

        const newText = "NewSecondRowText"
        await frontPrintContainerMesh.updateSecondRowText(newText, geometryOptions)

        const secondRowTextMesh = frontPrintContainerMesh.getChildrenMeshes().get("SecondRowText") as SecondRowTextMesh
        expect(secondRowTextMesh.updateTextGeometryOptions).toHaveBeenCalledWith(newText)
        expect(secondRowTextMesh.updateText).toHaveBeenCalledWith(geometryOptions)
    })

    it("should update second row visibility", async () => {
        const frontPrintContainerMesh = new FrontPrintContainerMesh(font)
        await frontPrintContainerMesh.init(geometryOptions)

        frontPrintContainerMesh.updateSecondRowVisibility(geometryOptions)

        const secondRowTextMesh = frontPrintContainerMesh.getChildrenMeshes().get("SecondRowText") as SecondRowTextMesh
        expect(secondRowTextMesh.setManualVisibility).toHaveBeenCalledWith(geometryOptions.secondRowVisible)

        const frontMWLogoMesh = frontPrintContainerMesh.getChildrenMeshes().get("FrontMWLogo") as FrontMWLogoMesh
        expect(frontMWLogoMesh.changeRelativeSize).toHaveBeenCalledWith(geometryOptions)

        const customLogoMesh = frontPrintContainerMesh.getChildrenMeshes().get("CustomLogo") as CustomLogoMesh
        if (customLogoMesh) {
            expect(customLogoMesh.changeRelativeSize).toHaveBeenCalledWith(geometryOptions)
        }
    })
})
