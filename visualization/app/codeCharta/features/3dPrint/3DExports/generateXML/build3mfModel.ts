export function getXMLmodel(vertices: string[], triangles: string[]): string {
    const modelHeader = _getXMLModelHeader()
    const verticesString = _getXMLModelVertices(vertices)
    const trianglesString = _getXMLModelTriangles(triangles)
    const modelFooter = _getXMLModelFooter()

    return modelHeader + verticesString + trianglesString + modelFooter
}

function _getXMLModelHeader(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:slic3rpe="http://schemas.slic3r.org/3mf/2017/06">
  <metadata name="Application">PrusaSlicer-2.7.2</metadata>
  <resources>
    <object id="1" type="model">
      <mesh>
`
}

function _getXMLModelVertices(vertices: string[]): string {
    let verticesString = `        <vertices>\n`
    for (const vertex of vertices) {
        verticesString += `          ${vertex}\n`
    }
    verticesString += `        </vertices>\n`
    return verticesString
}

function _getXMLModelTriangles(triangles: string[]): string {
    let trianglesString = `        <triangles>\n`
    for (const triangle of triangles) {
        trianglesString += `          ${triangle}\n`
    }
    trianglesString += `        </triangles>\n`
    return trianglesString
}

function _getXMLModelFooter(): string {
    return `      </mesh>
    </object>
  </resources>
  <build> <item objectid="1"/> </build>
</model>
`
}
