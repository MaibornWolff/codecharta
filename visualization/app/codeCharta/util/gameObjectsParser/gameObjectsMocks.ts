export const TEST_GAMEOBJECTS_FILE = {
    gameObjectPositions: [
        {
            name: "visualization.ui",
            position: {
                x: 159.5,
                y: 3.5,
                z: 8.5
            },
            scale: {
                x: 5,
                y: 1,
                z: 5
            }
        },
        {
            name: "visualization.packageLock",
            position: {
                x: 82,
                y: 5,
                z: 89
            },
            scale: {
                x: 2,
                y: 4,
                z: 2
            }
        },
        {
            name: ".visualization",
            position: {
                x: 84,
                y: 2.5,
                z: 48
            },
            scale: {
                x: 160,
                y: 1,
                z: 88
            }
        },
        {
            name: "root.CHANGELOG",
            position: {
                x: 84,
                y: 2.5,
                z: 552.5
            },
            scale: {
                x: 5,
                y: 1,
                z: 5
            }
        },
        {
            name: "root",
            position: {
                x: 84,
                y: 0.5,
                z: 279.5
            },
            scale: {
                x: 168,
                y: 1,
                z: 559
            }
        }
    ],
    cycles: [
        {
            from: "root.CHANGELOG",
            to: "root.visualization.packageLock"
        }
    ]
}
