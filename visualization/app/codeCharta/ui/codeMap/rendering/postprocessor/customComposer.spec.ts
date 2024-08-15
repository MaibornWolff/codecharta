import { Clock, WebGLRenderer, WebGLRenderTarget } from "three"
import { Pass, FullScreenQuad } from "three/examples/jsm/postprocessing/Pass"
import { CustomComposer } from "./customComposer"

describe("CustomComposer", () => {
    let renderer: WebGLRenderer
    let renderTarget: WebGLRenderTarget
    let customComposer: CustomComposer

    const mockGL = () => {
        renderer = {
            render: jest.fn(),
            getRenderTarget: jest.fn(),
            setRenderTarget: jest.fn(),
            info: {
                render: {},
                memory: {}
            },
            getPixelRatio: jest.fn().mockReturnValue(1)
        } as unknown as WebGLRenderer

        renderTarget = {
            clone: jest.fn().mockReturnValue({
                texture: {
                    name: null
                }
            })
        } as unknown as WebGLRenderTarget

        customComposer = new CustomComposer(renderer, renderTarget)
    }

    beforeEach(() => {
        mockGL()
    })

    describe("getInfo", () => {
        it("should return initial result", () => {
            expect(customComposer.getInfo()).toStrictEqual({
                calls: 0,
                frame: 0,
                lines: 0,
                triangles: 0,
                points: 0
            })
        })

        it("should update stats when webgl infos", () => {
            const renderInfo = {
                calls: 10,
                frame: 0,
                lines: 10,
                triangles: 10,
                points: 10
            }

            customComposer["info"] = [renderInfo]

            expect(customComposer.getInfo()).toStrictEqual(renderInfo)
        })
    })

    describe("getMemoryInfo", () => {
        it("should return initial values", () => {
            expect(customComposer.getMemoryInfo()).toStrictEqual({
                geometries: 0,
                textures: 0
            })
        })

        it("should update stats when threejs infos changes", () => {
            const memoryInfo = {
                geometries: 10,
                textures: 10
            }

            customComposer["memInfo"] = [memoryInfo]

            expect(customComposer.getMemoryInfo()).toStrictEqual(memoryInfo)
        })
    })

    describe("render", () => {
        beforeEach(() => {
            customComposer.clock = {
                getDelta: jest.fn()
            } as unknown as Clock

            customComposer.swapBuffers = jest.fn()
        })

        it("should call getDelta", () => {
            customComposer.render()

            expect(customComposer.clock.getDelta).toBeCalled()
        })

        it("should not call getDelta when delta time is available", () => {
            customComposer.render(1)

            expect(customComposer.clock.getDelta).not.toBeCalled()
        })

        it("should call renderer getRenderTarget", () => {
            customComposer.render()

            expect(renderer.getRenderTarget).toBeCalled()
        })

        it("should call swapBuffers when needSwap is active", () => {
            customComposer.passes = [
                {
                    enabled: true,
                    render: jest.fn(),
                    needsSwap: true
                } as unknown
            ] as Pass[]

            customComposer.render()

            expect(customComposer.swapBuffers).toHaveBeenCalledTimes(1)
        })

        it("should call renderer setRenderTarget", () => {
            customComposer.render()

            expect(renderer.setRenderTarget).toBeCalled()
        })
    })

    describe("dispose", () => {
        let fullScreenQuad: FullScreenQuad

        beforeAll(() => {
            fullScreenQuad = new FullScreenQuad()
            fullScreenQuad["fsQuad"] = {
                material: {
                    dispose: jest.fn()
                },
                _mesh: {
                    geometry: {
                        dispose: jest.fn()
                    }
                }
            }
        })

        it("should not call dispose", () => {
            customComposer.passes = [{ enabled: true }, { enabled: true }] as Pass[]

            customComposer.dispose()

            expect(fullScreenQuad["fsQuad"].material.dispose).not.toBeCalled()
            expect(fullScreenQuad["fsQuad"]._mesh.geometry.dispose).not.toBeCalled()
        })

        it("should call dispose only once", () => {
            customComposer.passes = [
                {
                    enabled: true
                } as Pass,
                fullScreenQuad as unknown as Pass
            ]

            customComposer.dispose()

            expect(fullScreenQuad["fsQuad"].material.dispose).toBeCalled()
            expect(fullScreenQuad["fsQuad"]._mesh.geometry.dispose).toBeCalled()
        })
    })
})
