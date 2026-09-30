import { Injectable } from "@angular/core"
import { ChartRegistry } from "../../../util/chartRegistry"

@Injectable({ providedIn: "root" })
export class DependencyGraphChartRegistry extends ChartRegistry {}
