import {isStandalone} from "./envDetector";
import * as fs from "fs";

export class LazyLoader {

    static openFile(fileName: string, nodePath: string){

        if (!isStandalone()){
            return
        }
        if (localStorage.getItem(fileName) === null){
            this.setDirectory(fileName)
        }
        else if (!fs.existsSync(localStorage.getItem(fileName))){
            alert(`unknown or nonexistent directory: ${localStorage.getItem(fileName)}`)
            this.setDirectory(fileName)
        }
        const path = nodePath.replace("root", localStorage.getItem(fileName))
        window.open(`file:///${path}`)
    }

    private static setDirectory(fileName: string){
        const directoryName = prompt("Please enter a root directory path of the project", "C:/")
        localStorage.setItem(fileName, directoryName)
    }
}
