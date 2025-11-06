import { ComponentFixture, TestBed } from "@angular/core/testing"
import { screen } from "@testing-library/angular"
import { ExternalLinksComponent } from "./externalLinks.component"

describe("ExternalLinksComponent", () => {
    let fixture: ComponentFixture<ExternalLinksComponent>

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ExternalLinksComponent]
        })

        fixture = TestBed.createComponent(ExternalLinksComponent)
        fixture.detectChanges()
    })

    it("should render all external links", () => {
        // Assert
        const websiteLink = screen.getByRole("link", { name: /website/i })
        const documentationLink = screen.getByRole("link", { name: /documentation/i })
        const githubLink = screen.getByRole("link", { name: /github/i })

        expect(websiteLink).toBeTruthy()
        expect(documentationLink).toBeTruthy()
        expect(githubLink).toBeTruthy()
    })

    it("should have correct href attributes", () => {
        // Assert
        const websiteLink = screen.getByRole("link", { name: /website/i }) as HTMLAnchorElement
        const documentationLink = screen.getByRole("link", { name: /documentation/i }) as HTMLAnchorElement
        const githubLink = screen.getByRole("link", { name: /github/i }) as HTMLAnchorElement

        expect(websiteLink.href).toBe("https://codecharta.com/")
        expect(documentationLink.href).toBe("https://codecharta.com/docs/overview/introduction")
        expect(githubLink.href).toBe("https://github.com/MaibornWolff/codecharta/")
    })

    it("should open links in new tab with security attributes", () => {
        // Assert
        const links = screen.getAllByRole("link")

        for (const link of links) {
            expect(link.getAttribute("target")).toBe("_blank")
            expect(link.getAttribute("rel")).toBe("noopener noreferrer")
        }
    })

    it("should display external link icons", () => {
        // Assert
        const externalLinkIcons = document.querySelectorAll(".fa-external-link")
        expect(externalLinkIcons.length).toBe(3)
    })

    it("should apply DaisyUI link styling", () => {
        // Assert
        const links = screen.getAllByRole("link")

        for (const link of links) {
            expect(link.classList.contains("link")).toBe(true)
            expect(link.classList.contains("link-primary")).toBe(true)
        }
    })
})
