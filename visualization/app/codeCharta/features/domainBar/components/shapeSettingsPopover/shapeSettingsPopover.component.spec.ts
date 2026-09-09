import { signal } from "@angular/core"
import { provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { provideMockState } from "../../../../mocks/state.mocks"
import { defaultWordCloudSettings, WordCloudShape } from "../../../../model/wordCloud.model"
import { CustomShapeMaskStore } from "../../stores/customShapeMask.store"
import { DomainBarReadStore } from "../../stores/domainBar.read.store"
import { DomainBarWriteStore } from "../../stores/domainBar.write.store"
import { ShapeSettingsPopoverComponent } from "./shapeSettingsPopover.component"

const A_SHAPE = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64"/></svg>'
const A_SCRIPTED_SHAPE = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><script>alert(1)</script></svg>'

function svgFile(name: string, markup: string): File {
    return new File([markup], name, { type: "image/svg+xml" })
}

describe("ShapeSettingsPopoverComponent", () => {
    let writeStore: jest.Mocked<Partial<DomainBarWriteStore>>
    let maskStore: CustomShapeMaskStore

    async function setup(shape = WordCloudShape.custom) {
        writeStore = { setShape: jest.fn() }
        maskStore = new CustomShapeMaskStore()
        return render(ShapeSettingsPopoverComponent, {
            inputs: { popoverId: "domain-bar-shape", anchorName: "domain-bar-shape-cog" },
            providers: [
                provideMockState(),
                provideMockStore(),
                { provide: DomainBarReadStore, useValue: { settings: signal({ ...defaultWordCloudSettings, shape }) } },
                { provide: DomainBarWriteStore, useValue: writeStore },
                { provide: CustomShapeMaskStore, useValue: maskStore }
            ]
        })
    }

    it("should offer an upload only while the custom shape is picked", async () => {
        // Arrange & Act
        await setup(WordCloudShape.circle)

        // Assert
        expect(screen.queryByTestId("domain-bar-shape-upload")).toBeNull()
    })

    it("should say the cloud stays round until a shape is uploaded", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("domain-bar-shape-hint").textContent).toContain("forgotten on reload")
    })

    it("should hand an uploaded shape to the cloud, named by its file", async () => {
        // Arrange
        await setup()

        // Act
        await userEvent.upload(screen.getByTestId("domain-bar-shape-upload"), svgFile("heart.svg", A_SHAPE))

        // Assert — the file is read asynchronously, so the mask lands a tick after the upload
        await waitFor(() => expect(maskStore.mask()?.fileName).toBe("heart.svg"))
        expect(maskStore.dataUri()).toContain("data:image/svg+xml,")
        expect(screen.getByTestId("domain-bar-shape-file").textContent).toContain("heart.svg")
    })

    it("should refuse a shape the cloud cannot be laid out inside, and keep the one in use", async () => {
        // Arrange
        await setup()
        await userEvent.upload(screen.getByTestId("domain-bar-shape-upload"), svgFile("heart.svg", A_SHAPE))
        await waitFor(() => expect(maskStore.mask()?.fileName).toBe("heart.svg"))

        // Act
        await userEvent.upload(screen.getByTestId("domain-bar-shape-upload"), svgFile("bad.svg", A_SCRIPTED_SHAPE))

        // Assert
        await waitFor(() => expect(screen.getByTestId("domain-bar-shape-rejection").textContent).toContain("<script>"))
        expect(maskStore.mask()?.fileName).toBe("heart.svg")
    })

    it("should keep the shape in use when the file dialog is cancelled", async () => {
        // Arrange
        await setup()
        await userEvent.upload(screen.getByTestId("domain-bar-shape-upload"), svgFile("heart.svg", A_SHAPE))
        await waitFor(() => expect(maskStore.mask()?.fileName).toBe("heart.svg"))

        // Act — a cancelled dialog fires a change with no file
        fireEvent.change(screen.getByTestId("domain-bar-shape-upload"), { target: { files: [] } })

        // Assert
        expect(maskStore.mask()?.fileName).toBe("heart.svg")
        expect(screen.queryByTestId("domain-bar-shape-rejection")).toBeNull()
    })

    it("should pass a picked shape on to the settings", async () => {
        // Arrange
        await setup()

        // Act
        await userEvent.selectOptions(screen.getByTestId("domain-bar-shape"), WordCloudShape.star)

        // Assert
        expect(writeStore.setShape).toHaveBeenCalledWith(WordCloudShape.star)
    })
})
