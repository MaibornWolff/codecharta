import { Injectable } from "@angular/core"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Node } from "../../../../codeCharta.model"
import * as d3 from "d3-scale-chromatic"

export interface CameraState {
    position: THREE.Vector3
    target: THREE.Vector3
    zoom?: number
    left?: number
    right?: number
    top?: number
    bottom?: number
    fov?: number
    aspect?: number
}

@Injectable({
    providedIn: "root"
})
export class VisualizationService {
    private scene: THREE.Scene
    private camera: THREE.OrthographicCamera
    private perspectiveCamera: THREE.PerspectiveCamera
    private activeCamera: THREE.Camera
    private renderer: THREE.WebGLRenderer
    private controls: OrbitControls
    private lights: THREE.Group
    private readonly raycaster = new THREE.Raycaster()
    private readonly mouse = new THREE.Vector2()
    private readonly HIGHLIGHT_COLOR = new THREE.Color(0x007bff)
    private readonly originalMaterials = new Map<THREE.Mesh, THREE.Material>()
    private nodeRandomColorMap: Map<string, THREE.Color> = new Map()

    initThreeJs(container: HTMLElement): void {
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xffffff)

        // Initialize orthographic camera (2D)
        this.camera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 1000)
        this.camera.position.set(0, 0, 100)

        // Initialize perspective camera (3D)
        const aspect = container.clientWidth / container.clientHeight
        this.perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 10, 1)
        this.perspectiveCamera.position.set(0, 0, 300)

        // Set active camera based on view mode
        this.activeCamera = this.camera

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            precision: "highp"
        })
        this.renderer.setSize(container.clientWidth, container.clientHeight)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        container.appendChild(this.renderer.domElement)

        this.controls = new OrbitControls(this.activeCamera, this.renderer.domElement)
    }

    setActiveCamera(is3DView: boolean, viewSize?: number): void {
        this.activeCamera = is3DView ? this.perspectiveCamera : this.camera
        this.controls.object = this.activeCamera

        if (is3DView) {
            const maxDimension = Math.max(viewSize || 100, 100)
            const cameraDistance = maxDimension * 1.5
            this.perspectiveCamera.position.set(0, -cameraDistance * 0.7, cameraDistance * 0.7)
            this.controls.target.set(0, 0, 0)
            this.perspectiveCamera.far = cameraDistance * 10
            this.perspectiveCamera.updateProjectionMatrix()
            this.controls.enableRotate = true
        }

        this.controls.update()
    }

    updateDimensions(container: HTMLElement, viewSize: number, is3DView: boolean): void {
        const aspect = container.clientWidth / container.clientHeight

        if (is3DView) {
            this.perspectiveCamera.aspect = aspect
            this.perspectiveCamera.updateProjectionMatrix()
        } else {
            const horizontalSize = viewSize
            const verticalSize = viewSize

            if (aspect < 1) {
                this.camera.left = -horizontalSize / 2
                this.camera.right = horizontalSize / 2
                this.camera.top = horizontalSize / (2 * aspect)
                this.camera.bottom = -horizontalSize / (2 * aspect)
            } else {
                this.camera.left = (-verticalSize * aspect) / 2
                this.camera.right = (verticalSize * aspect) / 2
                this.camera.top = verticalSize / 2
                this.camera.bottom = -verticalSize / 2
            }

            this.camera.updateProjectionMatrix()
            this.camera.position.set(0, 0, 100)
            this.controls.target.set(0, 0, 0)
            this.controls.update()
        }
    }

    updateLighting(is3DView: boolean): void {
        // Remove existing lights
        if (this.lights) {
            this.scene.remove(this.lights)
        }

        // Remove any existing ambient light
        const existingAmbientLights = this.scene.children.filter(child => child.type === "AmbientLight")
        for (const light of existingAmbientLights) {
            this.scene.remove(light)
        }

        if (is3DView) {
            this.lights = new THREE.Group()

            const ambilight = new THREE.AmbientLight(0x909090, 1)
            const light1 = new THREE.DirectionalLight(0xffffff, 5)
            light1.position.set(0, 50, 10).normalize()
            light1.castShadow = true
            light1.shadow.mapSize.width = 2048
            light1.shadow.mapSize.height = 2048
            light1.shadow.camera.near = 0.5
            light1.shadow.camera.far = 500

            const light2 = new THREE.DirectionalLight(0xffffff, 5)
            light2.position.set(0, -50, 10).normalize()
            light2.castShadow = true
            light2.shadow.mapSize.width = 2048
            light2.shadow.mapSize.height = 2048
            light2.shadow.camera.near = 0.5
            light2.shadow.camera.far = 500

            this.lights.add(ambilight)
            this.lights.add(light1)
            this.lights.add(light2)

            this.scene.add(this.lights)
        } else {
            const ambientLight = new THREE.AmbientLight(0xffffff, 3)
            this.scene.add(ambientLight)
        }
    }

    clearScene(): void {
        this.originalMaterials.clear()

        // Clear all objects from scene except lights
        const objectsToRemove = this.scene.children.filter(
            child => child.type !== "AmbientLight" && child.type !== "DirectionalLight" && child !== this.lights
        )
        for (const obj of objectsToRemove) {
            this.scene.remove(obj)
        }
    }

    onMouseMove(
        event: MouseEvent,
        container: HTMLElement,
        nodeObjects: THREE.Mesh[],
        onHover: (node: Node | null, mesh: THREE.Mesh | null) => void
    ): void {
        const rect = container.getBoundingClientRect()
        this.mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1
        this.mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1

        this.raycaster.setFromCamera(this.mouse, this.activeCamera)
        const intersects = this.raycaster.intersectObjects(nodeObjects)

        if (intersects.length > 0) {
            const object = intersects[0].object as THREE.Mesh
            const node = object.userData.nodeData
            onHover(node, object)
        } else {
            onHover(null, null)
        }
    }

    highlightNode(mesh: THREE.Mesh, isSearchHighlighted = false): void {
        if (!this.originalMaterials.has(mesh)) {
            this.originalMaterials.set(mesh, mesh.material as THREE.Material)
        }

        if (isSearchHighlighted) {
            mesh.material = new THREE.MeshLambertMaterial({
                color: this.HIGHLIGHT_COLOR.clone().multiplyScalar(1.3)
            })
        } else {
            const originalMaterial = mesh.material as THREE.MeshLambertMaterial
            const highlightedMaterial = originalMaterial.clone()
            const color = new THREE.Color(originalMaterial.color)
            highlightedMaterial.color.set(color).multiplyScalar(1.3)
            mesh.material = highlightedMaterial
        }
    }

    unhighlightNode(mesh: THREE.Mesh, isSearchHighlighted = false): void {
        if (this.originalMaterials.has(mesh)) {
            if (isSearchHighlighted) {
                mesh.material = new THREE.MeshLambertMaterial({
                    color: this.HIGHLIGHT_COLOR
                })
            } else {
                mesh.material = this.originalMaterials.get(mesh)
                this.originalMaterials.delete(mesh)
            }
        }
    }

    updateSearchHighlighting(searchTerm: string, nodeObjects: THREE.Mesh[]): THREE.Mesh[] {
        // Clear previous search highlights
        for (const mesh of nodeObjects) {
            if (this.originalMaterials.has(mesh)) {
                mesh.material = this.originalMaterials.get(mesh)
                this.originalMaterials.delete(mesh)
            }
        }

        const searchHighlightedMeshes: THREE.Mesh[] = []

        if (!searchTerm.trim()) {
            return searchHighlightedMeshes
        }

        const searchTermLower = searchTerm.toLowerCase()

        for (const mesh of nodeObjects) {
            const node = mesh.userData.nodeData as Node
            if (node.name?.toLowerCase().includes(searchTermLower)) {
                if (!this.originalMaterials.has(mesh)) {
                    this.originalMaterials.set(mesh, mesh.material as THREE.Material)
                }

                mesh.material = new THREE.MeshLambertMaterial({
                    color: this.HIGHLIGHT_COLOR
                })
                searchHighlightedMeshes.push(mesh)
            }
        }

        return searchHighlightedMeshes
    }

    applyMetricColoring(
        nodeObjects: THREE.Mesh[],
        nodes: Node[],
        selectedColorMetric: string,
        colorMetricMinThreshold: number,
        colorMetricMaxThreshold: number,
        invertColors: boolean
    ): void {
        if (!selectedColorMetric || nodes.length === 0) {
            return
        }

        const maxDepth = Math.max(...nodes.map(node => node.depth || 0), 1)

        for (const mesh of nodeObjects) {
            const node = mesh.userData.nodeData as Node
            if (node.isLeaf) {
                const value = node.attributes?.[selectedColorMetric] ?? 0

                let normalizedValue
                if (value <= colorMetricMinThreshold) {
                    normalizedValue = 0
                } else if (value >= colorMetricMaxThreshold) {
                    normalizedValue = 1
                } else {
                    normalizedValue = (value - colorMetricMinThreshold) / (colorMetricMaxThreshold - colorMetricMinThreshold)
                }

                if (invertColors) {
                    normalizedValue = 1 - normalizedValue
                }

                const d3Color = d3.interpolateRdYlGn(normalizedValue)
                mesh.material = new THREE.MeshLambertMaterial({ color: new THREE.Color(d3Color) })
            } else {
                const normalizedDepth = (node.depth || 0) / maxDepth
                const greyValue = normalizedDepth * 0.7
                mesh.material = new THREE.MeshLambertMaterial({
                    color: new THREE.Color(greyValue, greyValue, greyValue)
                })
            }
        }
    }

    colorNodesRandomly(nodeObjects: THREE.Mesh[], nodes: Node[]): void {
        const maxDepth = Math.max(...nodes.map(node => node.depth || 0), 1)
        for (const mesh of nodeObjects) {
            const node = mesh.userData.nodeData as Node
            if (!node.isLeaf) {
                const normalizedDepth = (node.depth || 0) / maxDepth
                const grayscaleColor = new THREE.Color(normalizedDepth, normalizedDepth, normalizedDepth)
                mesh.material = new THREE.MeshLambertMaterial({ color: grayscaleColor })
            } else {
                const nodeId = node.path || node.name
                let color = this.nodeRandomColorMap.get(nodeId)
                if (!color) {
                    color = this.generateDeterministicColor(nodeId)
                    this.nodeRandomColorMap.set(nodeId, color)
                }
                mesh.material = new THREE.MeshLambertMaterial({ color })
            }
        }
    }

    restoreLavaColoring(nodeObjects: THREE.Mesh[], nodes: Node[]): void {
        for (const mesh of nodeObjects) {
            const node = mesh.userData.nodeData as Node
            const normalizedDepth = (node.depth || 0) / Math.max(...nodes.map(n => n.depth || 0), 1)
            const lavaColor = this.interpolateColor(normalizedDepth)
            mesh.material = new THREE.MeshLambertMaterial({ color: lavaColor })
        }
    }

    takeScreenshot(container: HTMLElement, viewSize: number, is3DView: boolean): void {
        if (!this.renderer) {
            console.error("Renderer not initialized")
            return
        }

        // Save current state
        const originalWidth = container.clientWidth
        const originalHeight = container.clientHeight
        const originalBackground = this.scene.background
        const cameraState = this.saveCameraState()

        // Screenshot settings
        const screenshotWidth = 1200
        const screenshotHeight = 800
        const screenshotAspect = screenshotWidth / screenshotHeight

        // Apply screenshot settings
        this.renderer.setSize(screenshotWidth, screenshotHeight)
        this.scene.background = new THREE.Color(0xffffff)

        if (!is3DView) {
            const margin = 1.05
            const adjustedViewSize = viewSize * margin

            this.camera.position.set(0, 0, 100)

            if (screenshotAspect > 1) {
                this.camera.left = (-adjustedViewSize * screenshotAspect) / 2
                this.camera.right = (adjustedViewSize * screenshotAspect) / 2
                this.camera.top = adjustedViewSize / 2
                this.camera.bottom = -adjustedViewSize / 2
            } else {
                this.camera.left = -adjustedViewSize / 2
                this.camera.right = adjustedViewSize / 2
                this.camera.top = adjustedViewSize / screenshotAspect / 2
                this.camera.bottom = -adjustedViewSize / screenshotAspect / 2
            }

            this.camera.zoom = 1
            this.camera.updateProjectionMatrix()
            this.controls.target.set(0, 0, 0)
            this.controls.update()
        } else {
            this.perspectiveCamera.aspect = screenshotAspect
            this.perspectiveCamera.updateProjectionMatrix()
        }

        // Take screenshot
        this.renderer.render(this.scene, this.activeCamera)
        this.renderer.domElement.toBlob(async blob => {
            if (blob) {
                try {
                    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
                } catch (error) {
                    console.error("Failed to copy screenshot to clipboard:", error)
                }
            }
        })

        // Restore state
        this.restoreCameraState(cameraState)
        this.renderer.setSize(originalWidth, originalHeight)
        this.scene.background = originalBackground
        this.renderer.render(this.scene, this.activeCamera)
    }

    render(): void {
        this.renderer.render(this.scene, this.activeCamera)
    }

    getScene(): THREE.Scene {
        return this.scene
    }

    getRenderer(): THREE.WebGLRenderer {
        return this.renderer
    }

    getControls(): OrbitControls {
        return this.controls
    }

    dispose(): void {
        if (this.renderer) {
            this.renderer.dispose()
        }
    }

    private generateDeterministicColor(str: string): THREE.Color {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i)
            hash |= 0
        }
        const r = ((hash >> 16) & 0xff) / 255
        const g = ((hash >> 8) & 0xff) / 255
        const b = (hash & 0xff) / 255
        const min = 0.1,
            max = 0.9
        return new THREE.Color(min + (max - min) * Math.abs(r), min + (max - min) * Math.abs(g), min + (max - min) * Math.abs(b))
    }

    private interpolateColor(value: number): THREE.Color {
        value = Math.max(0, Math.min(1, value))
        const d3Color = d3.interpolateMagma(value)
        return new THREE.Color(d3Color)
    }

    private saveCameraState(): CameraState {
        const state: CameraState = {
            position: this.activeCamera.position.clone(),
            target: this.controls.target.clone()
        }

        if (this.activeCamera instanceof THREE.OrthographicCamera) {
            const cam = this.activeCamera
            state.zoom = cam.zoom
            state.left = cam.left
            state.right = cam.right
            state.top = cam.top
            state.bottom = cam.bottom
        } else if (this.activeCamera instanceof THREE.PerspectiveCamera) {
            const cam = this.activeCamera
            state.fov = cam.fov
            state.aspect = cam.aspect
        }

        return state
    }

    private restoreCameraState(state: CameraState): void {
        this.activeCamera.position.copy(state.position)
        this.controls.target.copy(state.target)

        if (this.activeCamera instanceof THREE.OrthographicCamera && state.zoom !== undefined) {
            const cam = this.activeCamera
            cam.zoom = state.zoom
            cam.left = state.left!
            cam.right = state.right!
            cam.top = state.top!
            cam.bottom = state.bottom!
            cam.updateProjectionMatrix()
        } else if (this.activeCamera instanceof THREE.PerspectiveCamera && state.fov !== undefined) {
            const cam = this.activeCamera
            cam.fov = state.fov
            cam.aspect = state.aspect!
            cam.updateProjectionMatrix()
        }

        this.controls.update()
    }
}
