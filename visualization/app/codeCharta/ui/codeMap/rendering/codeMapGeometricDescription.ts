import { CodeMapBuilding } from "./codeMapBuilding"
import { Vector3, Ray, Box3 } from "three"
import { Scaling } from "../../../codeCharta.model"

const BVH_LEAF_THRESHOLD = 4
// BVH node layout: [minX, minY, minZ, maxX, maxY, maxZ, leftChild, rightChild, firstIndex, count]
// Internal node: leftChild >= 0, rightChild >= 0, firstIndex = -1
// Leaf node: leftChild = -1, rightChild = -1, firstIndex >= 0, count > 0
const NODE_SIZE = 10
const NODE_OFFSETS = {
    minX: 0,
    minY: 1,
    minZ: 2,
    maxX: 3,
    maxY: 4,
    maxZ: 5,
    left: 6,
    right: 7,
    first: 8,
    count: 9
} as const

interface AABB {
    minX: number
    minY: number
    minZ: number
    maxX: number
    maxY: number
    maxZ: number
}

/**
 * NOTE: The BVH acceleration structure is beneficial for large scenes but may have overhead
 * compared to a linear scan for scenes with fewer than ~1000 buildings.
 */
export class CodeMapGeometricDescription {
    private _buildings: CodeMapBuilding[] = []
    private buildingsByPath: Map<string, CodeMapBuilding> = new Map()
    private mapSize: number
    private scales: Vector3
    private scaledBoxes: Box3[] = []
    private boxTranslation = new Vector3()
    private readonly _intersectTarget = new Vector3()

    // BVH data
    private bvhNodes: Float32Array | null = null
    private bvhIndices: Int32Array | null = null
    private bvhNodeCount = 0

    constructor(mapSize: number) {
        this.mapSize = mapSize
        this.scales = new Vector3(1, 1, 1)
    }

    add(building: CodeMapBuilding) {
        this._buildings.push(building)
        this.buildingsByPath.set(building.node.path, building)
    }

    get buildings() {
        return this._buildings
    }

    setScales(scales: Scaling) {
        this.scales = new Vector3(scales.x, scales.y, scales.z)
        this.rebuildScaledBoxes()
    }

    getBuildingByPath(path: string) {
        return this.buildingsByPath.get(path)
    }

    private rebuildScaledBoxes() {
        this.boxTranslation.set(-this.scales.x * this.mapSize, 0, -this.scales.z * this.mapSize)
        this.rebuildPathMap()

        this.scaledBoxes = this._buildings.map(building => {
            const box = building.boundingBox.clone()
            box.min.multiply(this.scales)
            box.max.multiply(this.scales)
            box.translate(this.boxTranslation)
            return box
        })

        this.buildBVH()
    }

    private rebuildPathMap() {
        this.buildingsByPath.clear()
        for (const building of this._buildings) {
            this.buildingsByPath.set(building.node.path, building)
        }
    }

    // --- BVH Construction ---

    private buildBVH() {
        const count = this._buildings.length
        if (count === 0) {
            this.bvhNodes = null
            this.bvhIndices = null
            return
        }

        this.bvhIndices = new Int32Array(count)
        for (let i = 0; i < count; i++) {
            this.bvhIndices[i] = i
        }

        const centroids = this.computeCentroids()
        this.bvhNodes = new Float32Array(2 * count * NODE_SIZE)
        this.bvhNodeCount = 0
        this.buildBVHNode(0, count, centroids)
    }

    private computeCentroids(): Float32Array {
        const count = this._buildings.length
        const centroids = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const box = this.scaledBoxes[i]
            centroids[i * 3] = (box.min.x + box.max.x) * 0.5
            centroids[i * 3 + 1] = (box.min.y + box.max.y) * 0.5
            centroids[i * 3 + 2] = (box.min.z + box.max.z) * 0.5
        }
        return centroids
    }

    private buildBVHNode(start: number, end: number, centroids: Float32Array): number {
        const nodeIndex = this.bvhNodeCount++
        const offset = nodeIndex * NODE_SIZE
        const nodeCount = end - start

        const aabb = this.computeAABB(start, end)
        this.storeAABB(offset, aabb)

        if (nodeCount <= BVH_LEAF_THRESHOLD) {
            this.storeLeafNode(offset, start, nodeCount)
        } else {
            this.storeInternalNode(offset, start, end, aabb, centroids)
        }

        return nodeIndex
    }

    private storeLeafNode(offset: number, start: number, nodeCount: number) {
        this.bvhNodes[offset + NODE_OFFSETS.left] = -1
        this.bvhNodes[offset + NODE_OFFSETS.right] = -1
        this.bvhNodes[offset + NODE_OFFSETS.first] = start
        this.bvhNodes[offset + NODE_OFFSETS.count] = nodeCount
    }

    private storeInternalNode(offset: number, start: number, end: number, aabb: AABB, centroids: Float32Array) {
        const splitIndex = this.partitionOnLongestAxis(start, end, aabb, centroids)
        const leftChild = this.buildBVHNode(start, splitIndex, centroids)
        const rightChild = this.buildBVHNode(splitIndex, end, centroids)

        this.bvhNodes[offset + NODE_OFFSETS.left] = leftChild
        this.bvhNodes[offset + NODE_OFFSETS.right] = rightChild
        this.bvhNodes[offset + NODE_OFFSETS.first] = -1
        this.bvhNodes[offset + NODE_OFFSETS.count] = 0
    }

    private computeAABB(start: number, end: number): AABB {
        let minX = Number.POSITIVE_INFINITY
        let minY = Number.POSITIVE_INFINITY
        let minZ = Number.POSITIVE_INFINITY
        let maxX = Number.NEGATIVE_INFINITY
        let maxY = Number.NEGATIVE_INFINITY
        let maxZ = Number.NEGATIVE_INFINITY
        for (let i = start; i < end; i++) {
            const box = this.scaledBoxes[this.bvhIndices[i]]
            minX = Math.min(minX, box.min.x)
            minY = Math.min(minY, box.min.y)
            minZ = Math.min(minZ, box.min.z)
            maxX = Math.max(maxX, box.max.x)
            maxY = Math.max(maxY, box.max.y)
            maxZ = Math.max(maxZ, box.max.z)
        }
        return { minX, minY, minZ, maxX, maxY, maxZ }
    }

    private storeAABB(offset: number, { minX, minY, minZ, maxX, maxY, maxZ }: AABB) {
        this.bvhNodes[offset + NODE_OFFSETS.minX] = minX
        this.bvhNodes[offset + NODE_OFFSETS.minY] = minY
        this.bvhNodes[offset + NODE_OFFSETS.minZ] = minZ
        this.bvhNodes[offset + NODE_OFFSETS.maxX] = maxX
        this.bvhNodes[offset + NODE_OFFSETS.maxY] = maxY
        this.bvhNodes[offset + NODE_OFFSETS.maxZ] = maxZ
    }

    // TODO: This uses a simple midpoint split on the longest axis. For scenes where building
    // sizes vary wildly, a SAH (Surface Area Heuristic) split would produce a more balanced
    // tree and reduce traversal cost, but it is significantly more complex to implement.
    private partitionOnLongestAxis(start: number, end: number, aabb: AABB, centroids: Float32Array): number {
        const extX = aabb.maxX - aabb.minX
        const extY = aabb.maxY - aabb.minY
        const extZ = aabb.maxZ - aabb.minZ
        const axis = getLongestAxis(extX, extY, extZ)
        const midpoints = [aabb.minX + extX * 0.5, aabb.minY + extY * 0.5, aabb.minZ + extZ * 0.5]
        const mid = midpoints[axis]

        let left = start
        let right = end - 1
        while (left <= right) {
            if (centroids[this.bvhIndices[left] * 3 + axis] < mid) {
                left++
            } else {
                ;[this.bvhIndices[left], this.bvhIndices[right]] = [this.bvhIndices[right], this.bvhIndices[left]]
                right--
            }
        }

        if (left === start || left === end) {
            left = start + Math.floor((end - start) / 2)
        }
        return left
    }

    // --- Ray Intersection ---

    intersect(ray: Ray) {
        if (!this.bvhNodes || !this.bvhIndices) {
            return undefined
        }

        let intersectedBuilding: CodeMapBuilding | undefined
        let leastIntersectedDistance = Number.POSITIVE_INFINITY

        const invDirX = 1 / ray.direction.x
        const invDirY = 1 / ray.direction.y
        const invDirZ = 1 / ray.direction.z

        const stack: number[] = [0]
        let stackPointer = 1

        while (stackPointer > 0) {
            const nodeIndex = stack[--stackPointer]
            const offset = nodeIndex * NODE_SIZE

            if (!this.rayIntersectsNode(offset, ray.origin, invDirX, invDirY, invDirZ, leastIntersectedDistance)) {
                continue
            }

            const firstIndex = this.bvhNodes[offset + NODE_OFFSETS.first]

            if (firstIndex >= 0) {
                const result = this.intersectLeaf(ray, firstIndex, this.bvhNodes[offset + NODE_OFFSETS.count], leastIntersectedDistance)
                if (result.distance < leastIntersectedDistance) {
                    leastIntersectedDistance = result.distance
                    intersectedBuilding = result.building
                }
            } else {
                stack[stackPointer++] = this.bvhNodes[offset + NODE_OFFSETS.left]
                stack[stackPointer++] = this.bvhNodes[offset + NODE_OFFSETS.right]
            }
        }

        return intersectedBuilding
    }

    private intersectLeaf(
        ray: Ray,
        firstIndex: number,
        leafCount: number,
        bestDistance: number
    ): { building: CodeMapBuilding | undefined; distance: number } {
        let building: CodeMapBuilding | undefined
        let distance = bestDistance

        for (let i = firstIndex; i < firstIndex + leafCount; i++) {
            const buildingIndex = this.bvhIndices[i]
            const intersectionPoint = ray.intersectBox(this.scaledBoxes[buildingIndex], this._intersectTarget)
            if (!intersectionPoint) {
                continue
            }
            const d = intersectionPoint.distanceTo(ray.origin)
            if (d < distance) {
                distance = d
                building = this._buildings[buildingIndex]
            }
        }

        return { building, distance }
    }

    private rayIntersectsNode(
        offset: number,
        origin: Vector3,
        invDirX: number,
        invDirY: number,
        invDirZ: number,
        maxDistance: number
    ): boolean {
        const tMinX = (this.bvhNodes[offset + NODE_OFFSETS.minX] - origin.x) * invDirX
        const tMaxX = (this.bvhNodes[offset + NODE_OFFSETS.maxX] - origin.x) * invDirX
        const tMinY = (this.bvhNodes[offset + NODE_OFFSETS.minY] - origin.y) * invDirY
        const tMaxY = (this.bvhNodes[offset + NODE_OFFSETS.maxY] - origin.y) * invDirY
        const tMinZ = (this.bvhNodes[offset + NODE_OFFSETS.minZ] - origin.z) * invDirZ
        const tMaxZ = (this.bvhNodes[offset + NODE_OFFSETS.maxZ] - origin.z) * invDirZ

        const tEnter = Math.max(Math.min(tMinX, tMaxX), Math.min(tMinY, tMaxY), Math.min(tMinZ, tMaxZ))
        const tExit = Math.min(Math.max(tMinX, tMaxX), Math.max(tMinY, tMaxY), Math.max(tMinZ, tMaxZ))

        return tExit >= tEnter && tExit >= 0 && tEnter < maxDistance
    }
}

function getLongestAxis(extX: number, extY: number, extZ: number): number {
    if (extX >= extY && extX >= extZ) {
        return 0
    }
    if (extY >= extZ) {
        return 1
    }
    return 2
}
