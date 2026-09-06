// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "CellarsAndCentaurs",
    products: [
        .library(name: "CellarsAndCentaurs", targets: ["CellarsAndCentaurs"]),
        .library(name: "CellarsAndCentaursPersistence", targets: ["CellarsAndCentaursPersistence"]),
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-log.git", from: "1.5.0"),
    ],
    targets: [
        .target(
            name: "CellarsAndCentaurs",
            dependencies: [.product(name: "Logging", package: "swift-log")]
        ),
        .target(
            name: "CellarsAndCentaursPersistence",
            dependencies: ["CellarsAndCentaurs"]
        ),
        .testTarget(
            name: "CellarsAndCentaursTests",
            dependencies: ["CellarsAndCentaurs"]
        ),
    ]
)
