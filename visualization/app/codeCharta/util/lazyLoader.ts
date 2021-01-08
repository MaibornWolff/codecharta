import {isStandalone} from "./envDetector"

export class LazyLoader {

    private static _fileName: string
    private static _nodePath: string

    static openFile(fileName:string = LazyLoader._fileName, nodePath:string = LazyLoader._nodePath){
        if (!isStandalone()){
            return
        }
        LazyLoader._fileName = fileName
        LazyLoader._nodePath = nodePath
        const directory = localStorage.getItem(LazyLoader._fileName)
        const path = nodePath.replace("root", directory)
        if (directory === null){
            LazyLoader.setDirectory()
            return
        }
        //check if root still exists
        LazyLoader.checkDirExists(directory).then(exists =>{
            if (!exists){
                alert(`Unknown or non-existent directory: ${directory}`)
                LazyLoader.setDirectory()
                return
            }
        })
        import("open").then(open => {
            open.default(`file:///${path}`).then(_ => _, error => alert(error))
        })
    }

    private static setDirectory(){
        let _default = "\\Users\\"
        if (navigator.userAgent.indexOf("Windows") !== 1){
            _default = "C:".concat(_default)
        }
        let directoryName = prompt("Please enter a root directory path of the project", _default)
        if (directoryName !== null && directoryName !== ""){
            directoryName = directoryName.split("\\").join("/")
            localStorage.setItem(LazyLoader._fileName, directoryName)
            LazyLoader.openFile()
        }
    }

    private static async checkDirExists(path: string){
        const fs = await import('fs')
        return fs.existsSync(path)
    }
}
