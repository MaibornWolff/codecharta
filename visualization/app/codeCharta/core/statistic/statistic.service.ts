import {CodeMap, CodeMapNode} from "../data/model/CodeMap";
import {Settings} from "../../core/settings/settings.service";
import {DataModel} from "../data/data.service";
import {node} from "../../ui/codeMap/rendering/node";
import {DialogService} from "../../ui/dialog/dialog.service";


export enum STATISTIC_OPS  {
    NOTHING =  "NOTHING",
    MEAN = "MEAN",
    MEDIAN = "MEDIAN",
    MAX = "MAX",
    MIN = "MIN",
    FASHION = "FASHION"
}

export class StatisticMapService {


    public static SELECTOR = "statisticMapService";

    constructor(private dialogService: DialogService) {

    }

    /*
     * Function that receives an array of maps and returns a map with a structure that contains every leaf contained in
     * any of the maps of the input array.
     * The attributes of the output map contain as values the result of an statistical operation applied to the values
     * of the input maps. That operation can be selected among the implemented ones by the operation value.
     * Every new statistical operation should  have a new value in STATISTIC_OPS and a new function, which should be
     * added to the statistic function switch.
     */
    unifyMaps(data: DataModel, settings: Settings): CodeMap {
        let operation = settings.operation || STATISTIC_OPS.NOTHING;
        if(operation == STATISTIC_OPS.NOTHING){
            return data.renderMap;
        }
        let maps: CodeMap[] = data.revisions;
        if(maps.length === 1){
            return maps[0];
        }

        let accumulated = {} as CodeMap;//Map that contains an array of every value of every map given in maps array
        accumulated.root = {} as CodeMapNode;
        let unified: CodeMap;
        accumulated.fileName = operation+"";
        for(let i: number=0; i<maps.length; i++){//Loop through every CodeMap of the input array and get all of them in accumulated
            //Only leaf have attributes and no child.
            //A CodeMap contains fileName, projectName and root. Here filename is added to accumulated
            accumulated.fileName= accumulated.fileName+"_"+maps[i].fileName;
            //Here projectName is added
            if(!accumulated.projectName || accumulated.projectName.length === 0){
                accumulated.projectName= maps[i].projectName;
            }
            //Create an empty map which contains every different leaf and node of every map in the input
            accumulated.root = this.createArrayMap(maps[i].root, accumulated.root, maps.length);
        }
        for(let i: number=0; i<maps.length; i++){
            //The empty accumulated map gets fulfilled with the values of every map in the maps array
            accumulated.root=this.fulfillMap(maps[i].root,accumulated.root, i);
        }
        unified = JSON.parse(JSON.stringify(accumulated));
        unified = this.emptyMap(unified);//The map is copied, before emptying it in order not to modify accumulated
        unified= this.applyStatistics(accumulated,unified, operation);
        return unified;
    }


    /*
     *  Returns a map which contains every different leaf and node of every map in the input map with an array for
     *  every attribute with "length" zeros
     */
    createArrayMap(input: CodeMapNode, output: CodeMapNode, length: number): CodeMapNode{
        let childExist: boolean= false;
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
        if(input.children&&input.children!=[]){
            if (!output.children ) {//if the output have no children we add it
                output.children = [JSON.parse(JSON.stringify(input.children[0]))];
            }
            for(let i: number=0; i<input.children.length; i++) {//Go through every child of the input
                //We look for the output children with the same name as the input children we are working with
                for (let j: number = 0; j < output.children.length; j++) {
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
    fulfillMap(input: CodeMapNode, output: CodeMapNode, position: number){
        if(!input.children||!output.children||Object.keys(output.children).length==0||
            Object.keys(input.children).length==0){
            for(let metric in input.attributes){
                output.attributes[metric][position] = input.attributes[metric];
            }
        }
        else{
            //Go through every position in the maps
            for(let i: number=0; i<input.children.length; i++) {
                for(let j: number=0;j<output.children.length; j++){
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
    emptyMap(output: any){
        if(output.root){
            output.root=this.emptyMap(output.root);
        }
        else if(output.children&&output.children.length!=0){
            for(let i=0;i<output.children.length;i++){
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
    applyStatistics(input: any,output: any, operation: STATISTIC_OPS): any{
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
    statistic(input: number[], operation: STATISTIC_OPS): number{
        switch(operation) {
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
                this.dialogService.showErrorDialog("The described statistical function, which is "+operation+" does not exist");
        }
        return -1;
    }


    /*
     * Function that returns the mean of the values in the input array.
     */
    mean(input: number[]): number{
        let output: number = 0.0;
        for(let i: number=0;i<input.length; i++){
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
    max(input: number[]): number{
        let output: number;
        for(let i: number=0;i<input.length; i++){
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
    min(input: number[]): number{
        let output;
        for(let i: number=0;i<input.length; i++){
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
    fashion(input: number[]): number{
        let frequency: any = {};//Object that contains every different value in input linked to its absolute frequency
        let fashion_frequency: number = 0;//Absolute frequency of the fashion value
        let fashion_value: number;
        for(let i: number=0;i<input.length; i++){
            if(input[i] !== undefined){
                if(!frequency[input[i]]){
                    frequency[input[i]] = 1;
                }
                else{
                    frequency[input[i]]++;
                }
            }
        }
        for(let value in frequency){
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
    median(input: number[]): number{
        let sorted: number[] = input.filter(function(value) { return value !== undefined; }).sort();
        let median: number;
        let num: number = sorted.length;
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
}