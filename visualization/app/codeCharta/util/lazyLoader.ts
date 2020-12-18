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
        if (localStorage.getItem(fileName) === null){
            LazyLoader.setDirectory()
            return
        }
        LazyLoader.checkDirExists().then((exists) =>{
            if (!exists){
                const message = `Unknown or non-existent directory: ${localStorage.getItem(LazyLoader._fileName)}`
                alert(message)
                LazyLoader.setDirectory()
                return
            }
        })
        const path: string = nodePath.replace("root", localStorage.getItem(LazyLoader._fileName))
        import("open").then(open => {
            open.default(`file:///${path}`).then(_ => _, error => alert(error))
        })
    }

    private static setDirectory(){
        const directoryName = prompt("Please enter a root directory path of the project", "C:\\Users\\")
        if (directoryName !== null && directoryName !== ""){
            localStorage.setItem(LazyLoader._fileName, directoryName)
            LazyLoader.openFile()
        }
    }

    private static async checkDirExists(){
        return import('fs').then(fs => fs.existsSync(localStorage.getItem(LazyLoader._fileName)))
    }
}
