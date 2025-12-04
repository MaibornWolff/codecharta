import { TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { Print3DFacade } from "./facade"
import { Print3DService } from "./services/3dPrint.service"
import { ColorMode } from "../../codeCharta.model"

describe("Print3DFacade", () => {
    let facade: Print3DFacade
    let mockService: jest.Mocked<Print3DService>

    beforeEach(() => {
        mockService = {
            areaMetric$: jest.fn().mockReturnValue(of("rloc")),
            heightMetric$: jest.fn().mockReturnValue(of("mcc")),
            colorMetric$: jest.fn().mockReturnValue(of("complexity")),
            colorRange$: jest.fn().mockReturnValue(of({ from: 10, to: 50 })),
            colorMode$: jest.fn().mockReturnValue(of(ColorMode.absolute)),
            attributeDescriptors$: jest.fn().mockReturnValue(of({})),
            blacklist$: jest.fn().mockReturnValue(of([])),
            files$: jest.fn().mockReturnValue(of([])),
            setColorMode: jest.fn()
        } as unknown as jest.Mocked<Print3DService>

        TestBed.configureTestingModule({
            providers: [Print3DFacade, { provide: Print3DService, useValue: mockService }]
        })

        facade = TestBed.inject(Print3DFacade)
    })

    describe("areaMetric$", () => {
        it("should return observable from service", done => {
            // Act & Assert
            facade.areaMetric$().subscribe(value => {
                expect(value).toBe("rloc")
                expect(mockService.areaMetric$).toHaveBeenCalled()
                done()
            })
        })
    })

    describe("heightMetric$", () => {
        it("should return observable from service", done => {
            // Act & Assert
            facade.heightMetric$().subscribe(value => {
                expect(value).toBe("mcc")
                expect(mockService.heightMetric$).toHaveBeenCalled()
                done()
            })
        })
    })

    describe("colorMetric$", () => {
        it("should return observable from service", done => {
            // Act & Assert
            facade.colorMetric$().subscribe(value => {
                expect(value).toBe("complexity")
                expect(mockService.colorMetric$).toHaveBeenCalled()
                done()
            })
        })
    })

    describe("colorMode$", () => {
        it("should return observable from service", done => {
            // Act & Assert
            facade.colorMode$().subscribe(value => {
                expect(value).toBe(ColorMode.absolute)
                expect(mockService.colorMode$).toHaveBeenCalled()
                done()
            })
        })
    })

    describe("setColorMode", () => {
        it("should call service setColorMode", () => {
            // Arrange & Act
            facade.setColorMode(ColorMode.absolute)

            // Assert
            expect(mockService.setColorMode).toHaveBeenCalledWith(ColorMode.absolute)
        })
    })
})
