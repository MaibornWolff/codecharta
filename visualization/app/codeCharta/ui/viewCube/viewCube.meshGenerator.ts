import { getBaseMaterialEdge, getBaseMaterialVertices, getBaseMaterialFace } from "./viewCube.materials"
import { BoxGeometry, Group, Mesh } from "three"

export class ViewCubemeshGenerator {
	static buildCube(edgeToFaceRatio: number) {
		const middleEdgeSize = 1 / edgeToFaceRatio
		const verticeSize = (1 - middleEdgeSize) / 2

		const cubeEdgeGeometry = new BoxGeometry(middleEdgeSize, verticeSize, verticeSize)
		const cubeVerticeGeometry = new BoxGeometry(verticeSize, verticeSize, verticeSize)
		const cubeFaceGeometry = new BoxGeometry(middleEdgeSize, middleEdgeSize, verticeSize)

		return ViewCubemeshGenerator.buildCubeGroup(cubeEdgeGeometry, cubeVerticeGeometry, cubeFaceGeometry)
	}

	private static buildCubeGroup(cubeEdgeGeometry: BoxGeometry, cubeVerticeGeometry: BoxGeometry, cubeFaceGeometry: BoxGeometry) {
		const group = new Group()
		const {
			group: fullFaceFront,
			topLeft: topLeftFront,
			topCenter: topCenterFront,
			topRight: topRightFront,
			bottomLeft: bottomLeftFront,
			bottomCenter: bottomCenterFront,
			bottomRight: bottomRightFront,
			middleLeft: middleLeftFront,
			middleCenter: middleCenterFront,
			middleRight: middleRightFront
		} = ViewCubemeshGenerator.buildFullFace(cubeEdgeGeometry, cubeVerticeGeometry, cubeFaceGeometry)
		const {
			group: fullFaceBack,
			topLeft: topLeftBack,
			topCenter: topCenterBack,
			topRight: topRightBack,
			bottomLeft: bottomLeftBack,
			bottomCenter: bottomCenterBack,
			bottomRight: bottomRightBack,
			middleLeft: middleLeftBack,
			middleCenter: middleCenterBack,
			middleRight: middleRightBack
		} = ViewCubemeshGenerator.buildFullFace(cubeEdgeGeometry, cubeVerticeGeometry, cubeFaceGeometry)
		const offset = cubeEdgeGeometry.parameters.width / 2 + cubeVerticeGeometry.parameters.width / 2
		fullFaceBack.position.z -= offset
		fullFaceFront.position.z += offset
		const {
			group: middleRing,
			topLeftMiddle,
			topMiddleMiddle,
			topRightMiddle,
			middleLeftMiddle,
			middleRightMiddle,
			bottomLeftMiddle,
			bottomMiddleMiddle,
			bottomRightMiddle
		} = ViewCubemeshGenerator.buildMiddleRing(cubeFaceGeometry, cubeEdgeGeometry, cubeVerticeGeometry)
		group.add(fullFaceFront)
		group.add(fullFaceBack)
		group.add(middleRing)
		return {
			group,
			front: {
				top: {
					left: topLeftFront,
					middle: topCenterFront,
					right: topRightFront
				},
				middle: {
					left: middleRightFront,
					middle: middleCenterFront,
					right: middleLeftFront
				},
				bottom: {
					left: bottomLeftFront,
					middle: bottomCenterFront,
					right: bottomRightFront
				}
			},
			back: {
				top: {
					left: topLeftBack,
					middle: topCenterBack,
					right: topRightBack
				},
				middle: {
					left: middleLeftBack,
					middle: middleCenterBack,
					right: middleRightBack
				},
				bottom: {
					left: bottomLeftBack,
					middle: bottomCenterBack,
					right: bottomRightBack
				}
			},
			middle: {
				top: {
					left: topLeftMiddle,
					middle: topMiddleMiddle,
					right: topRightMiddle
				},
				middle: {
					left: middleLeftMiddle,
					right: middleRightMiddle
				},
				bottom: {
					left: bottomLeftMiddle,
					middle: bottomMiddleMiddle,
					right: bottomRightMiddle
				}
			}
		}
	}

	private static buildMiddleRing(cubeFaceGeometry: BoxGeometry, cubeEdgeGeometry: BoxGeometry, cubeVerticeGeometry: BoxGeometry) {
		const {
			group: middleFaceLeft,
			left: topLeftMiddle,
			right: bottomLeftMiddle,
			center: middleLeftMiddle
		} = ViewCubemeshGenerator.buildMiddleFace(cubeFaceGeometry, cubeEdgeGeometry)
		const {
			group: middleFaceRight,
			left: topRightMiddle,
			right: bottomRightMiddle,
			center: middleRightMiddle
		} = ViewCubemeshGenerator.buildMiddleFace(cubeFaceGeometry, cubeEdgeGeometry)
		const faceCenterTop = new Mesh(cubeFaceGeometry, getBaseMaterialFace())
		const faceCenterBottom = new Mesh(cubeFaceGeometry, getBaseMaterialFace())
		const offset = cubeEdgeGeometry.parameters.width / 2 + cubeVerticeGeometry.parameters.width / 2
		middleFaceLeft.position.x -= offset
		middleFaceLeft.rotation.x = Math.PI / 2
		middleFaceLeft.rotation.y = Math.PI / 2
		middleFaceRight.position.x += offset
		middleFaceRight.rotation.x = Math.PI / 2
		middleFaceRight.rotation.y = Math.PI / 2
		faceCenterBottom.position.y -= offset
		faceCenterBottom.rotation.x = Math.PI / 2
		faceCenterTop.position.y += offset
		faceCenterTop.rotation.x = Math.PI / 2
		const group = new Group()
		group.add(middleFaceLeft)
		group.add(middleFaceRight)
		group.add(faceCenterBottom)
		group.add(faceCenterTop)

		return {
			group,
			topLeftMiddle,
			topMiddleMiddle: faceCenterTop,
			topRightMiddle,
			middleLeftMiddle,
			middleRightMiddle,
			bottomLeftMiddle,
			bottomMiddleMiddle: faceCenterBottom,
			bottomRightMiddle
		}
	}

	private static buildFullFace(cubeEdgeGeometry: BoxGeometry, cubeVerticeGeometry: BoxGeometry, cubeFaceGeometry: BoxGeometry) {
		const { group: topEdge, left: topLeft, right: topRight, center: topCenter } = ViewCubemeshGenerator.buildFullEdge(
			cubeEdgeGeometry,
			cubeVerticeGeometry
		)
		const { group: bottomEdge, left: bottomLeft, right: bottomRight, center: bottomCenter } = ViewCubemeshGenerator.buildFullEdge(
			cubeEdgeGeometry,
			cubeVerticeGeometry
		)
		const offset = cubeEdgeGeometry.parameters.height / 2 + cubeFaceGeometry.parameters.height / 2
		topEdge.position.y += offset
		bottomEdge.position.y -= offset
		const { group: middleFace, left: middleLeft, right: middleRight, center: middleCenter } = ViewCubemeshGenerator.buildMiddleFace(
			cubeFaceGeometry,

			cubeEdgeGeometry
		)
		const group = new Group()
		group.add(topEdge)
		group.add(bottomEdge)
		group.add(middleFace)
		return {
			group,
			topLeft,
			topCenter,
			topRight,
			bottomLeft,
			bottomCenter,
			bottomRight,
			middleLeft,
			middleCenter,
			middleRight
		}
	}

	private static buildMiddleFace(cubeFaceGeometry: BoxGeometry, cubeEdgeGeometry: BoxGeometry) {
		const faceCenter = new Mesh(cubeFaceGeometry, getBaseMaterialFace())
		const edgeLeft = new Mesh(cubeEdgeGeometry, getBaseMaterialEdge())
		const edgeRight = new Mesh(cubeEdgeGeometry, getBaseMaterialEdge())
		const offset = cubeFaceGeometry.parameters.height / 2 + cubeEdgeGeometry.parameters.height / 2
		edgeLeft.position.y -= offset
		edgeRight.position.y += offset
		const group = new Group()
		group.rotation.z = Math.PI / 2
		group.add(faceCenter)
		group.add(edgeLeft)
		group.add(edgeRight)
		return {
			group,
			left: edgeLeft,
			right: edgeRight,
			center: faceCenter
		}
	}

	private static buildFullEdge(cubeEdgeGeometry: BoxGeometry, cubeVerticeGeometry: BoxGeometry) {
		const edgeCenter = new Mesh(cubeEdgeGeometry, getBaseMaterialEdge())
		const verticeLeft = new Mesh(cubeVerticeGeometry, getBaseMaterialVertices())
		const verticeRight = new Mesh(cubeVerticeGeometry, getBaseMaterialVertices())
		const offset = cubeEdgeGeometry.parameters.width / 2 + cubeVerticeGeometry.parameters.width / 2
		verticeLeft.position.x -= offset
		verticeRight.position.x += offset
		const group = new Group()
		group.add(edgeCenter)
		group.add(verticeLeft)
		group.add(verticeRight)
		return {
			group,
			left: verticeLeft,
			right: verticeRight,
			center: edgeCenter
		}
	}
}
