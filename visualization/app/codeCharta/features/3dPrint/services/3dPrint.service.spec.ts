import { TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { Print3DService } from "./3dPrint.service"
import { Print3DStore } from "../stores/3dPrint.store"
import { ColorMode } from "../../../codeCharta.model"

describe("Print3DService", () => {
    let service: Print3DService
    let mockStore: jest.Mocked<Print3DStore>

    beforeEach(() => {
        mockStore = {
            areaMetric$: of("rloc"),
            heightMetric$: of("mcc"),
            colorMetric$: of("complexity"),
            colorRange$: of({ from: 10, to: 50 }),
            colorMode$: of(ColorMode.absolute),
            attributeDescriptors$: of({}),
            blacklist$: of([]),
            files$: of([]),
            setColorMode: jest.fn()
        } as unknown as jest.Mocked<Print3DStore>

        TestBed.configureTestingModule({
            providers: [Print3DService, { provide: Print3DStore, useValue: mockStore }]
        })

        service = TestBed.inject(Print3DService)
    })

    describe("areaMetric$", () => {
        it("should return observable from store", done => {
            // Act & Assert
            service.areaMetric$().subscribe(value => {
                expect(value).toBe("rloc")
                done()
            })
        })
    })

    describe("heightMetric$", () => {
        it("should return observable from store", done => {
            // Act & Assert
            service.heightMetric$().subscribe(value => {
                expect(value).toBe("mcc")
                done()
            })
        })
    })

    describe("colorMetric$", () => {
        it("should return observable from store", done => {
            // Act & Assert
            service.colorMetric$().subscribe(value => {
                expect(value).toBe("complexity")
                done()
            })
        })
    })

    describe("colorMode$", () => {
        it("should return observable from store", done => {
            // Act & Assert
            service.colorMode$().subscribe(value => {
                expect(value).toBe(ColorMode.absolute)
                done()
            })
        })
    })

    describe("setColorMode", () => {
        it("should call store setColorMode", () => {
            // Arrange & Act
            service.setColorMode(ColorMode.absolute)

            // Assert
            expect(mockStore.setColorMode).toHaveBeenCalledWith(ColorMode.absolute)
        })
    })
})
