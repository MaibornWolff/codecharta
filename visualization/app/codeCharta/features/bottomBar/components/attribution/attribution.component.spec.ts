import { render } from "@testing-library/angular"
import packageJson from "../../../../../../package.json"
import { AttributionComponent } from "./attribution.component"

describe("AttributionComponent", () => {
    it("should render the heart character, the MaibornWolff link, and the version with a v prefix", async () => {
        // Arrange & Act
        const { container } = await render(AttributionComponent)

        // Assert
        expect(container.textContent).toContain("❤")

        const link = container.querySelector("a")
        expect(link).not.toBeNull()
        expect(link.getAttribute("href")).toBe("https://www.maibornwolff.de/en/")
        expect(link.textContent).toBe("MaibornWolff")

        expect(container.textContent).toContain(`v${packageJson.version}`)
    })
})
