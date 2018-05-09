import {Settings} from "../../core/settings/settings.service";
import {DataModel} from "../data/data.service";
import {node} from "../../ui/codeMap/rendering/node";
import {DialogService} from "../../ui/dialog/dialog.service";


export class AggregateMapService {


    public static SELECTOR = "statisticMapService";

    constructor(private dialogService: DialogService) {

    }
}