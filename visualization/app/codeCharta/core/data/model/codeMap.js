export class CodeMap {



    constructor(name, timestamp, root) {

        if(arguments.length === 1) {
            Object.assign(this,name);
        } else {
            this.name = name;
            this.timestamp = timestamp;
            this.root = root;
        }

    }


}