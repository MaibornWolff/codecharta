import { getBaseMaterialEdge, getBaseMaterialVertices, getBaseMaterialFace } from "./viewCube.materials"
import { BoxGeometry, Group, Mesh } from "three"

export class ViewCubemeshGenerator {
    static buildCube(edgeToFaceRatio: number) {
        const middleEdgeSize = 1 / edgeToFaceRatio
        const verticeSize = (1 - middleEdgeSize) / 2

        const cubeTopEdgeGeometry = new BoxGeometry(middleEdgeSize, verticeSize, verticeSize)
        const cubeSideEdgeGeometry = new BoxGeometry(verticeSize, middleEdgeSize + verticeSize, verticeSize)
        const cubeVerticeGeometry = new BoxGeometry(verticeSize, verticeSize, verticeSize)
        const cubeTopFaceGeometry = new BoxGeometry(middleEdgeSize, middleEdgeSize, verticeSize)
        const cubeSideFaceGeometry = new BoxGeometry(middleEdgeSize, middleEdgeSize + verticeSize, verticeSize)

        return ViewCubemeshGenerator.newBuildCubeGroup(
            cubeTopEdgeGeometry,
            cubeSideEdgeGeometry,
            cubeVerticeGeometry,
            cubeTopFaceGeometry,
            cubeSideFaceGeometry
        )
    }

    private static newBuildCubeGroup(
        cubeTopEdgeGeometry: BoxGeometry,
        cubeSideEdgeGeometry: BoxGeometry,
        cubeVerticeGeometry: BoxGeometry,
        cubeTopFaceGeometry: BoxGeometry,
        cubeSideFaceGeometry: BoxGeometry
    ) {
        const group = new Group()
        const {
            group: cubeTopFace,
            frontLeft: topFrontLeft,
            frontCenter: topFrontCenter,
            frontRight: topFrontRight,
            middleLeft: topMiddleLeft,
            middleCenter: topMiddleCenter,
            middleRight: topMiddleRight,
            backLeft: topBackLeft,
            backCenter: topbackCenter,
            backRight: topBackRight
        } = ViewCubemeshGenerator.buildCubeTopFace(cubeTopEdgeGeometry, cubeVerticeGeometry, cubeTopFaceGeometry)
        group.add(cubeTopFace)

        const {
            group: cubeSides,
            frontLeftEdge: sideFrontLeft,
            frontCenterFace: sideFrontCenter,
            frontRightEdge: sideFrontRight,
            middleLeftFace: sideMiddleLeft,
            middleRightFace: sideMiddleRight,
            backLeftEdge: sideBackLeft,
            backCenterFace: sideBackCenter,
            backRightEdge: sideBackRight
        } = ViewCubemeshGenerator.buildCubeSides(cubeSideEdgeGeometry, cubeSideFaceGeometry)
        group.add(cubeSides)

        return {
            group,
            top: {
                front: {
                    left: topFrontLeft,
                    center: topFrontCenter,
                    right: topFrontRight
                },
                middle: {
                    left: topMiddleLeft,
                    center: topMiddleCenter,
                    right: topMiddleRight
                },
                back: {
                    left: topBackLeft,
                    center: topbackCenter,
                    right: topBackRight
                }
            },
            sides: {
                front: {
                    left: sideFrontLeft,
                    center: sideFrontCenter,
                    right: sideFrontRight
                },
                middle: {
                    left: sideMiddleLeft,
                    right: sideMiddleRight
                },
                back: {
                    left: sideBackLeft,
                    center: sideBackCenter,
                    right: sideBackRight
                }
            }
        }
    }

    private static buildCubeTopFace(cubeEdgeGeometry: BoxGeometry, cubeVerticeGeometry: BoxGeometry, cubeFaceGeometry: BoxGeometry) {
        const frontLeftVertice = new Mesh(cubeVerticeGeometry, getBaseMaterialVertices())
        const frontCenterEdge = new Mesh(cubeEdgeGeometry, getBaseMaterialEdge())
        const frontRightVertice = new Mesh(cubeVerticeGeometry, getBaseMaterialVertices())

        const middleLeftEdge = new Mesh(cubeEdgeGeometry, getBaseMaterialEdge())
        const middleCenterFace = new Mesh(cubeFaceGeometry, getBaseMaterialFace())
        const middleRightEdge = new Mesh(cubeEdgeGeometry, getBaseMaterialFace())

        const backLeftVertice = new Mesh(cubeVerticeGeometry, getBaseMaterialVertices())
        const backCenterEdge = new Mesh(cubeEdgeGeometry, getBaseMaterialEdge())
        const backRightVertice = new Mesh(cubeVerticeGeometry, getBaseMaterialVertices())

        const offset = cubeFaceGeometry.parameters.height / 2 + cubeVerticeGeometry.parameters.height / 2

        frontLeftVertice.position.x -= offset
        frontLeftVertice.position.y -= offset
        frontCenterEdge.position.y -= offset
        frontRightVertice.position.x += offset
        frontRightVertice.position.y -= offset

        middleLeftEdge.position.x -= offset
        middleLeftEdge.rotation.z = Math.PI / 2
        middleRightEdge.position.x += offset
        middleRightEdge.rotation.z = Math.PI / 2

        backLeftVertice.position.x -= offset
        backLeftVertice.position.y += offset
        backCenterEdge.position.y += offset
        backRightVertice.position.x += offset
        backRightVertice.position.y += offset

        const group = new Group()
        group.rotation.x = Math.PI / 2
        group.position.y += offset

        group.add(frontLeftVertice)
        group.add(frontCenterEdge)
        group.add(frontRightVertice)

        group.add(middleLeftEdge)
        group.add(middleCenterFace)
        group.add(middleRightEdge)

        group.add(backLeftVertice)
        group.add(backCenterEdge)
        group.add(backRightVertice)

        return {
            group,
            frontLeft: frontLeftVertice,
            frontCenter: frontCenterEdge,
            frontRight: frontRightVertice,
            middleLeft: middleLeftEdge,
            middleCenter: middleCenterFace,
            middleRight: middleRightEdge,
            backLeft: backLeftVertice,
            backCenter: backCenterEdge,
            backRight: backRightVertice
        }
    }

    private static buildCubeSides(cubeEdgeGeometry: BoxGeometry, cubeFaceGeometry: BoxGeometry) {
        const frontLeftEdge = new Mesh(cubeEdgeGeometry, getBaseMaterialEdge())
        const frontCenterFace = new Mesh(cubeFaceGeometry, getBaseMaterialFace())
        const frontRightEdge = new Mesh(cubeEdgeGeometry, getBaseMaterialEdge())

        const middleLeftFace = new Mesh(cubeFaceGeometry, getBaseMaterialFace())
        const middleRightFace = new Mesh(cubeFaceGeometry, getBaseMaterialFace())

        const backLeftEdge = new Mesh(cubeEdgeGeometry, getBaseMaterialEdge())
        const backCenterFace = new Mesh(cubeFaceGeometry, getBaseMaterialFace())
        const backRightEdge = new Mesh(cubeEdgeGeometry, getBaseMaterialEdge())

        const offset = cubeFaceGeometry.parameters.width / 2 + cubeEdgeGeometry.parameters.width / 2
        const verticalOffset = cubeEdgeGeometry.parameters.width / 2

        frontLeftEdge.position.x -= offset
        frontLeftEdge.position.z += offset
        frontCenterFace.position.z += offset
        frontRightEdge.position.x += offset
        frontRightEdge.position.z += offset

        middleLeftFace.position.x -= offset
        middleLeftFace.rotation.y = Math.PI / 2
        middleRightFace.position.x += offset
        middleRightFace.rotation.y = Math.PI / 2

        backLeftEdge.position.x -= offset
        backLeftEdge.position.z -= offset
        backCenterFace.position.z -= offset
        backRightEdge.position.x += offset
        backRightEdge.position.z -= offset

        const group = new Group()
        group.position.y -= verticalOffset

        group.add(frontLeftEdge)
        group.add(frontCenterFace)
        group.add(frontRightEdge)

        group.add(middleLeftFace)
        group.add(middleRightFace)

        group.add(backLeftEdge)
        group.add(backCenterFace)
        group.add(backRightEdge)

        return {
            group,
            frontLeftEdge,
            frontCenterFace,
            frontRightEdge,
            middleLeftFace,
            middleRightFace,
            backLeftEdge,
            backCenterFace,
            backRightEdge
        }
    }
}
