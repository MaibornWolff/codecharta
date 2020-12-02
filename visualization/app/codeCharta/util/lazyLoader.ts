
export function openFolderDialog(fileName: string){
    if (localStorage.getItem(fileName) === null && confirm("Directory not chosen. Choose now?")){
        const input = document.createElement("input")
        input.setAttribute('title', 'choose directory')
        input.setAttribute('type', 'file');
        input.setAttribute('webkitdirectory', 'true')
        input.setAttribute('directory', 'true')
        input.setAttribute('mozdirectory', 'true')
        input.setAttribute('msdirectory', 'true')
        input.setAttribute('odirectory', 'true')
        input.onchange = function(){
            localStorage.setItem(fileName, input.value)
            alert(input.files[0].type)
        }
        input.click()
    }
}