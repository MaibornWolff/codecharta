import { NgModule } from "@angular/core"
import { AggregationTypePipe } from "./aggregationType.pipe"

@NgModule({
	declarations: [AggregationTypePipe],
	exports: [AggregationTypePipe]
})
export class AggregationTypeModule {}
