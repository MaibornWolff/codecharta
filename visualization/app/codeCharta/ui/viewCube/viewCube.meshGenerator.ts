import * as THREE from "three";
import {
    getBaseMaterialEdge,
    getBaseMaterialVertices,
    getBaseMaterialFace
} from "./viewCube.materials";

export class ViewCubemeshGenerator {
    public static buildCube(edgeToFaceRatio: number) {
        const middleEdgeSize = 1 / edgeToFaceRatio;
        const verticeSize = (1 - middleEdgeSize) / 2;

        const cubeEdgeGeometry = new THREE.BoxGeometry(
            middleEdgeSize,
            verticeSize,
            verticeSize
        );
        const cubeVerticeGeometry = new THREE.BoxGeometry(
            verticeSize,
            verticeSize,
            verticeSize
        );
        const cubeFaceGeometry = new THREE.BoxGeometry(
            middleEdgeSize,
            middleEdgeSize,
            verticeSize
        );

        return ViewCubemeshGenerator.buildCubeGroup(
            cubeEdgeGeometry,
            cubeVerticeGeometry,
            cubeFaceGeometry
        );
    }

    private static buildCubeGroup(
        cubeEdgeGeometry: THREE.BoxGeometry,
        cubeVerticeGeometry: THREE.BoxGeometry,
        cubeFaceGeometry: THREE.BoxGeometry
    ) {
        const group = new THREE.Group();
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
        } = ViewCubemeshGenerator.buildFullFace(
            cubeEdgeGeometry,
            cubeVerticeGeometry,
            cubeFaceGeometry
        );
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
        } = ViewCubemeshGenerator.buildFullFace(
            cubeEdgeGeometry,
            cubeVerticeGeometry,
            cubeFaceGeometry
        );
        const offset =
            cubeEdgeGeometry.parameters.width / 2 +
            cubeVerticeGeometry.parameters.width / 2;
        fullFaceBack.position.z -= offset;
        fullFaceFront.position.z += offset;
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
        } = ViewCubemeshGenerator.buildMiddleRing(
            cubeFaceGeometry,
            cubeEdgeGeometry,
            cubeVerticeGeometry
        );
        group.add(fullFaceFront);
        group.add(fullFaceBack);
        group.add(middleRing);
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
        };
    }

    private static buildMiddleRing(
        cubeFaceGeometry: THREE.BoxGeometry,
        cubeEdgeGeometry: THREE.BoxGeometry,
        cubeVerticeGeometry: THREE.BoxGeometry
    ) {
        const {
            group: middleFaceLeft,
            left: topLeftMiddle,
            right: bottomLeftMiddle,
            center: middleLeftMiddle
        } = ViewCubemeshGenerator.buildMiddleFace(
            cubeFaceGeometry,
            cubeEdgeGeometry
        );
        const {
            group: middleFaceRight,
            left: topRightMiddle,
            right: bottomRightMiddle,
            center: middleRightMiddle
        } = ViewCubemeshGenerator.buildMiddleFace(
            cubeFaceGeometry,
            cubeEdgeGeometry
        );
        const blueFaceCenterTop = new THREE.Mesh(
            cubeFaceGeometry,
            getBaseMaterialFace()
        );
        const blueFaceCenterBottom = new THREE.Mesh(
            cubeFaceGeometry,
            getBaseMaterialFace()
        );
        const offset =
            cubeEdgeGeometry.parameters.width / 2 +
            cubeVerticeGeometry.parameters.width / 2;
        middleFaceLeft.position.x -= offset;
        middleFaceLeft.rotation.x = Math.PI / 2;
        middleFaceLeft.rotation.y = Math.PI / 2;
        middleFaceRight.position.x += offset;
        middleFaceRight.rotation.x = Math.PI / 2;
        middleFaceRight.rotation.y = Math.PI / 2;
        blueFaceCenterBottom.position.y -= offset;
        blueFaceCenterBottom.rotation.x = Math.PI / 2;
        blueFaceCenterTop.position.y += offset;
        blueFaceCenterTop.rotation.x = Math.PI / 2;
        const group = new THREE.Group();
        group.add(middleFaceLeft);
        group.add(middleFaceRight);
        group.add(blueFaceCenterBottom);
        group.add(blueFaceCenterTop);

        return {
            group,
            topLeftMiddle: topLeftMiddle,
            topMiddleMiddle: blueFaceCenterTop,
            topRightMiddle: topRightMiddle,
            middleLeftMiddle: middleLeftMiddle,
            middleRightMiddle: middleRightMiddle,
            bottomLeftMiddle: bottomLeftMiddle,
            bottomMiddleMiddle: blueFaceCenterBottom,
            bottomRightMiddle: bottomRightMiddle
        };
    }

    private static buildFullFace(
        cubeEdgeGeometry: THREE.BoxGeometry,
        cubeVerticeGeometry: THREE.BoxGeometry,
        cubeFaceGeometry: THREE.BoxGeometry
    ) {
        const {
            group: topEdge,
            left: topLeft,
            right: topRight,
            center: topCenter
        } = ViewCubemeshGenerator.buildFullEdge(
            cubeEdgeGeometry,
            cubeVerticeGeometry
        );
        const {
            group: bottomEdge,
            left: bottomLeft,
            right: bottomRight,
            center: bottomCenter
        } = ViewCubemeshGenerator.buildFullEdge(
            cubeEdgeGeometry,
            cubeVerticeGeometry
        );
        const offset =
            cubeEdgeGeometry.parameters.height / 2 +
            cubeFaceGeometry.parameters.height / 2;
        topEdge.position.y += offset;
        bottomEdge.position.y -= offset;
        const {
            group: middleFace,
            left: middleLeft,
            right: middleRight,
            center: middleCenter
        } = ViewCubemeshGenerator.buildMiddleFace(
            cubeFaceGeometry,

            cubeEdgeGeometry
        );
        const group = new THREE.Group();
        group.add(topEdge);
        group.add(bottomEdge);
        group.add(middleFace);
        return {
            group,
            topLeft: topLeft,
            topCenter: topCenter,
            topRight: topRight,
            bottomLeft: bottomLeft,
            bottomCenter: bottomCenter,
            bottomRight: bottomRight,
            middleLeft: middleLeft,
            middleCenter: middleCenter,
            middleRight: middleRight
        };
    }

    private static buildMiddleFace(
        cubeFaceGeometry: THREE.BoxGeometry,
        cubeEdgeGeometry: THREE.BoxGeometry
    ) {
        const blueFaceCenter = new THREE.Mesh(
            cubeFaceGeometry,
            getBaseMaterialFace()
        );
        const greenEdgeLeft = new THREE.Mesh(
            cubeEdgeGeometry,
            getBaseMaterialEdge()
        );
        const greenEdgeRight = new THREE.Mesh(
            cubeEdgeGeometry,
            getBaseMaterialEdge()
        );
        const offset =
            cubeFaceGeometry.parameters.height / 2 +
            cubeEdgeGeometry.parameters.height / 2;
        greenEdgeLeft.position.y -= offset;
        greenEdgeRight.position.y += offset;
        const group = new THREE.Group();
        group.rotation.z = Math.PI / 2;
        group.add(blueFaceCenter);
        group.add(greenEdgeLeft);
        group.add(greenEdgeRight);
        return {
            group,
            left: greenEdgeLeft,
            right: greenEdgeRight,
            center: blueFaceCenter
        };
    }

    private static buildFullEdge(
        cubeEdgeGeometry: THREE.BoxGeometry,
        cubeVerticeGeometry: THREE.BoxGeometry
    ) {
        const greenEdgeCenter = new THREE.Mesh(
            cubeEdgeGeometry,
            getBaseMaterialEdge()
        );
        const redVerticeLeft = new THREE.Mesh(
            cubeVerticeGeometry,
            getBaseMaterialVertices()
        );
        const redVerticeRight = new THREE.Mesh(
            cubeVerticeGeometry,
            getBaseMaterialVertices()
        );
        const offset =
            cubeEdgeGeometry.parameters.width / 2 +
            cubeVerticeGeometry.parameters.width / 2;
        redVerticeLeft.position.x -= offset;
        redVerticeRight.position.x += offset;
        const group = new THREE.Group();
        group.add(greenEdgeCenter);
        group.add(redVerticeLeft);
        group.add(redVerticeRight);
        return {
            group,
            left: redVerticeLeft,
            right: redVerticeRight,
            center: greenEdgeCenter
        };
    }
}
