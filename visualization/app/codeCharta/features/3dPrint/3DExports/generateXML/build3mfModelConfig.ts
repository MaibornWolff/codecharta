import { Volume } from "../serialize3mf.service"

export function getXMLmodelConfig(volumes: Volume[]): string {
    let modelConfig = _getXMLModelConfigHeader()

    for (const volume of volumes) {
        modelConfig += _getXMLModelConfigVolumes(volume)
    }

    modelConfig += _getXMLModelConfigFooter()

    return modelConfig
}

function _getXMLModelConfigHeader(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<config>
  <object id="1" instances_count="1">
    <metadata type="object" key="name" value="CodeCharta Map"/>
`
}

function _getXMLModelConfigVolumes(volume: Volume) {
    return `    <volume firstid="${volume.firstTriangleId}" lastid="${volume.lastTriangleId}">
      <metadata type="volume" key="name" value="${volume.name}"/>
      <metadata type="volume" key="extruder" value="${volume.extruder}"/>
      <metadata type="volume" key="source_object_id" value="1"/>
      <metadata type="volume" key="source_volume_id" value="${volume.id}"/>
    </volume>
`
}

function _getXMLModelConfigFooter(): string {
    return `  </object>
</config>
`
}
