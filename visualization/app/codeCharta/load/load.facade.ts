// Public surface of the load/ orchestration layer. Consumers above it (the app root component, the
// reset dialog) inject the initial-file loader through this barrel rather than a deep path.
export { LoadInitialFileService } from "./loadInitialFile.service"
