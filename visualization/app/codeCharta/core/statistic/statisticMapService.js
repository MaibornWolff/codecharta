import {CodeMap} from "../data/model/codeMap.js";


export const STATISTIC_OPS = {
    NOTHING: "NOTHING",
    MEAN: "MEAN",
    MEDIAN: "MEDIAN",
    MAX: "MAX",
    MIN: "MIN",
    FASHION: "FASHION"
};

export class StatisticMapService {

    constructor() {

    }

    /*
     * Function that receives an array of maps and returns a map with a structure that contains every leaf contained in
     * any of the maps of the input array.
     * The attributes of the output map contain as values the result of an statistical operation applied to the values
     * of the input maps. That operation can be selected among the implemented ones by the operation value.
     * Every new statistical operation should  have a new value in STATISTIC_OPS and a new function, which should be
     * added to the statistic function switch.
     */
    unifyMaps(maps, settings) {
        let operation = settings.operation || STATISTIC_OPS.NOTHING;
        if(operation == STATISTIC_OPS.NOTHING&&maps.length>1){
            var cleanMaps = [];
            for(var i=0;i<maps.length;i++){
                cleanMaps.push(this.unifyMaps([maps[i]],operation));
            }
            return cleanMaps[0]; //get correct map index
        }
        var accumulated  = new CodeMap();//Map that contains an array of every value of every map given in maps array
        var unified;
        for(var i=0; i<maps.length; i++){//Loop through every CodeMap of the input array and get all of them in accumulated
            //Only leaf have attributes and no child.
            //A CodeMap contains fileName, projectName and root. Here filename is added to accumulated
            if(accumulated.fileName.length === 0){
                accumulated.fileName=maps[i].fileName;
            }
            //Here projectName is added
            if(accumulated.projectName.length === 0){
                accumulated.projectName=maps[i].projectName;
            }
            //Create an empty map which contains every different leaf and node of every map in the input
            accumulated.root = this.createArrayMap(maps[i].root, accumulated.root, maps.length);
        }
        for(i=0; i<maps.length; i++){
            //The empty accumulated map gets fulfilled with the values of every map in the maps array
            accumulated.root=this.fulfillMap(maps[i].root,accumulated.root, i);
        }
        unified = JSON.parse(JSON.stringify(accumulated));
        unified = this.emptyMap(unified);
        unified= this.applyStatistics(accumulated,unified, operation);
        return unified;
    }


    /*
     *  Returns a map which contains every different leaf and node of every map in the input map with an array for
     *  every attribute with "length" zeros
     */
    createArrayMap(input, output, length){
        let childExist= false;
        for(let value in input){
            if(value!=="children"&&value!=="attributes"&&value!=="root"&&value!=="$$hashKey"){
                output[value]=input[value];
            }
            else if (value=="attributes"&&!output[value]){
                output[value]={};
            }
        }
        if(output.attributes&&output.attributes!=={}){
            for(let metric in output.attributes){
                output.attributes[metric]= Array.apply(null, Array(length));
            }
        }
        if(input.children&&input.children!={}){
            if (!output.children ) {//if the output have no children we add it
                output.children = [JSON.parse(JSON.stringify(input.children[0]))];
            }
            for(let i=0; i<input.children.length; i++) {//Go through every child of the input
                //We look for the output children with the same name as the input children we are working with
                for (let j = 0; j < output.children.length; j++) {
                    childExist = false;
                        //if the children of the input is already in the output we go through it
                    if (input.children[i].name === output.children[j].name) {
                        //We go recursiv to the children
                        output.children[j] = this.createArrayMap(input.children[i], output.children[j], length);
                        childExist = true;
                        break;
                    }
                }
                //if the children does not exist in the output its copied from the input
                if (!childExist) {
                    output.children.push(JSON.parse(JSON.stringify(input.children[i])));
                    //Once the children is copied we loop through it
                    output.children[output.children.length -1] =
                        this.createArrayMap(input.children[i], output.children[output.children.length -1], length);
                }
            }
        }
        return output;
    }


    /*
     * Receives a map with an array with n values for every attribute as output and a map with a single value in every
     * attribute as input and a position. The values of the input are added to the correspondent value in the output
     * attribute array in the position given in position value.
     * The output map should contain every children and node in output.
     */
    fulfillMap(input, output, position){
        if(!input.children||!output.children||Object.keys(output.children).length==0||
            Object.keys(input.children).length==0){
            for(let metric in input.attributes){
                output.attributes[metric][position] = input.attributes[metric];
            }
        }
        else{
            //Go through every position in the maps
            for(let i=0; i<input.children.length; i++) {
                for(let j=0;j<output.children.length; j++){
                    if(input.children[i].name==output.children[j].name){
                        output.children[j]= this.fulfillMap(input.children[i],output.children[j],position);
                    }
                }
            }
        }
        return output;
    }


    /*
    *  Returns a map which contains the same structure as the input map but contains no metric
    */
    emptyMap(output){
        if(output.root){
            output.root=this.emptyMap(output.root);
        }
        else if(output.children&&output.children.length!=0){
            for(var i=0;i<output.children.length;i++){
                output.children[i]=this.emptyMap(output.children[i]);
            }
        }
        else if(output.attributes&&output.attributes.length!=0){
            output.attributes = {};
        }
        return output;
    }

    /*
     * Receives a map which contains an array in every attribute and returns an array with the same structure as the
     * input but with a function applied to the values of the same attribute array for every attribute.
     * This function is determinated by the string in operation
     */
    applyStatistics(input,output, operation){
        //If the input has attributes, a function is applied to every metric and the returned value is given in output
        if(input.attributes&&Object.keys(input.attributes).length!=0){
            for(let metric in input.attributes){
                output.attributes[metric]=this.statistic(input.attributes[metric], operation);
            }
        }
        else if(input.children&&input.children.length!=0){
            //Go through every position in the maps
            for(let i=0; i<input.children.length; i++) {
                output.children[i]= this.applyStatistics(input.children[i],output.children[i],operation);
            }
        }
        else if (input.root){
            output.root= this.applyStatistics(input.root,output.root,operation);
        }
        return output;
    }


    /*
     * Function that returns the value of an statistical function over the values of the inputed array. This function
     * is defined by operation.
     * @param {STATISTICS_OPS} operation
     */
    statistic(input, operation){
        switch(operation) {
            case STATISTIC_OPS.NOTHING:
                return input[0];
            case STATISTIC_OPS.MEAN:
                return this.mean(input);
            case STATISTIC_OPS.MAX:
                return this.max(input);
            case STATISTIC_OPS.MIN:
                return this.min(input);
            case STATISTIC_OPS.FASHION:
                return this.fashion(input);
            case STATISTIC_OPS.MEDIAN:
                return this.median(input);
            default:
                console.log("The described statistical function, which is "+operation+" does not exist");
        }
        return -1;
    }


    /*
     * Function that returns the mean of the values in the input array.
     */
    mean(input){
        var output = 0.0;
        for(var i=0;i<input.length; i++){
            if(input[i] !== undefined){
                output+=input[i];
            }
        }
        output= output/input.length;
        return output;
    }

    /*
     * Function that returns the highest value of the input array
     */
    max(input){
        var output;
        for(var i=0;i<input.length; i++){
            if(input[i] !== undefined){
                if(output == undefined || output<input[i]){
                    output=input[i];
                }
            }
        }
        return output;
    }

    /*
     * Function that returns the lowest value of the input array
     */
    min(input){
        var output;
        for(var i=0;i<input.length; i++){
            if(input[i] !== undefined){
                if(output == undefined || output>input[i]){
                    output=input[i];
                }
            }
        }
        return output;
    }

    /*
     * Function that returns the most common value in the input array
     */
    fashion(input){
        var frequency = {};//Object that contains every different value in input linked to its absolute frequency
        var fashion_frequency = 0;//Absolute frequency of the fashion value
        var fashion_value;
        for(var i=0;i<input.length; i++){
            if(input[i] !== undefined){
                if(!frequency[input[i]]){
                    frequency[input[i]] = 1;
                }
                else{
                    frequency[input[i]]++;
                }
            }
        }
        for(var value in frequency){
            if(fashion_frequency< frequency[value]){
                fashion_frequency=frequency[value];
                fashion_value= parseInt(value);
            }
        }
        return fashion_value;
    }

    /*
     * Function that returns the median value in the input array
     */
    median(input){
        var sorted = input.filter(function(value) { return value !== undefined }).sort();
        var median;
        var num = sorted.length;
        if((num % 2) == 0){
            median = sorted[num/2];
        }
        else if (num > 1){
            median = (sorted[(num+1)/2]+sorted[(num-1)/2])/2;
        }
        else{
            median = sorted[0];
        }
        return median;
    }

    /*
     * Function that returns true when two objects contain the same even when it is not in the same order
     * ({a,b}=={b,a} would return true)
     * Only used in testing
     */

    unorderedCompare(a,b){
        var same = false;
        if(Object.keys(a).length==0&& JSON.stringify(a) != JSON.stringify(b)){
            return false;
        }
        for(var key in a){
            if(!b[key]||typeof(b[key])!=typeof(a[key])||Object.keys(a[key]).length!=Object.keys(b[key]).length){
                return false;
            }
        }
        for(var key in a){
            if(typeof(a[key])=="object"){
                if(!isNaN(key)){
                    for(var keyb in b){
                        if(this.unorderedCompare(a[key],b[keyb])){
                            same= true;
                        }
                    }
                    if(!same){
                        return false;
                    }
                }
                else if(!this.unorderedCompare(a[key],b[key])){
                    return false;
                }
            }
            else if(a[key]!=b[key]){
                return false;
            }
        }
        return true;
    }
}