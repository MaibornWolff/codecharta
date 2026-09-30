export const ERROR_MESSAGES = {
    fileIsInvalid: "File is empty or invalid.",
    checksumUnavailable: "File has no checksum, and the browser can only compute one when CodeCharta is opened via https or localhost.",
    apiVersionIsInvalid: "API Version is empty or invalid.",
    majorApiVersionIsOutdated: "API Version Outdated: Update CodeCharta API Version to match cc.json.",
    minorApiVersionOutdated: "Minor API Version Outdated.",
    nodesNotUnique: "Node names in combination with node types are not unique.",
    nodeIdsNotUnique: "Node ids are not unique.",
    unresolvedEdgeEndpoint: "Dependency edge dropped: an endpoint id does not resolve to a node.",
    unresolvedDomainWordsNodeId: "Domain lens word bank dropped: the node id does not resolve to a node.",
    nodesEmpty: "The nodes array is empty. At least one node is required.",
    notAllFoldersAreFixed: "If at least one direct sub-folder of root is marked as fixed, all direct sub-folders of root must be fixed.",
    fixedFoldersOutOfBounds: "Coordinates of fixed folders must be within a range of 0 and 100.",
    fixedFoldersOverlapped: "Folders may not overlap.",
    fixedFoldersNotAllowed: "Fixated folders may not be defined in API-Version < 1.2.",
    fileAlreadyExists: "File already exists.",
    excludesEveryBuilding: "Excluding all buildings is not possible.",
    fileContainsAuthorsAttribute:
        "File contains unsupported 'authors' attribute. This attribute will be ignored. Node containing the attribute: "
}
