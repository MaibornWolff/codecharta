
// 1. Download the electron binaries
// 2. Build the standalone desktop apps
// 3. Zip the apps

const DISTRIBUTIONS = {
  "win32" : ["ia32", "x64", "arm64"],
  "darwin" : ["x64", "arm64"],
  "linux" : ["x64", "arm64", "armv7l"],
};




module.exports = {
  DISTRIBUTIONS: DISTRIBUTIONS,
}
