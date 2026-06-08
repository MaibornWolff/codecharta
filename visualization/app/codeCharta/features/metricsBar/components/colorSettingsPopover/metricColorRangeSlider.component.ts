import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnChanges,
    SimpleChanges,
    ViewChild
} from "@angular/core"
import { calculateSliderRangePosition, SliderRangePosition, updateLeftThumb, updateRightThumb } from "./utils/SliderRangePosition"
import { RangeSliderLabelsComponent } from "./rangeSliderLabels.component"
import { parseChangedNumberInput } from "../../util/settingsInput"

export type HandleValueChange = (changedValue: { newLeftValue?: number; newRightValue?: number }) => void
export type CurrentlySliding = undefined | "leftThumb" | "rightThumb"

@Component({
    selector: "cc-metric-color-range-slider",
    templateUrl: "./metricColorRangeSlider.component.html",
    imports: [RangeSliderLabelsComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricColorRangeSliderComponent implements OnChanges {
    @Input() minValue: number
    @Input() maxValue: number
    @Input() currentLeftValue: number
    @Input() currentRightValue: number
    @Input() leftColor: string
    @Input() middleColor: string
    @Input() rightColor: string
    @Input() handleValueChange: HandleValueChange
    @Input() sliderWidth = 150

    @ViewChild("rangeSliderContainer") sliderContainer: ElementRef<HTMLDivElement>
    @ViewChild("leftThumb") leftThumb: ElementRef<HTMLDivElement>
    @ViewChild("rightThumb") rightThumb: ElementRef<HTMLDivElement>

    sliderRangePosition: SliderRangePosition = { leftEnd: 0, rightStart: 0 }
    thumbRadius = 7
    upcomingLeftValue: number
    upcomingRightValue: number

    private currentlySliding: CurrentlySliding = undefined

    constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges) {
        if (!this.currentlySliding) {
            this.sliderRangePosition = calculateSliderRangePosition({
                minValue: this.minValue,
                maxValue: this.maxValue,
                currentLeftValue: this.currentLeftValue,
                currentRightValue: this.currentRightValue,
                sliderWidth: this.sliderWidth
            })
            if (changes.currentLeftValue) {
                this.upcomingLeftValue = this.currentLeftValue
            }
            if (changes.currentRightValue) {
                this.upcomingRightValue = this.currentRightValue
            }
        }
    }

    setCurrentlySliding(currentlySliding: CurrentlySliding) {
        this.currentlySliding = currentlySliding
        switch (this.currentlySliding) {
            case "leftThumb":
                document.addEventListener("mousemove", this.handleLeftThumbMoved)
                this.rightThumb.nativeElement.style.zIndex = "0"
                this.leftThumb.nativeElement.style.zIndex = "1"
                this.resetCurrentlySlidingOnNextMouseUp(this.handleLeftThumbMoved)
                break

            case "rightThumb":
                document.addEventListener("mousemove", this.handleRightThumbMoved)
                this.leftThumb.nativeElement.style.zIndex = "0"
                this.rightThumb.nativeElement.style.zIndex = "1"
                this.resetCurrentlySlidingOnNextMouseUp(this.handleRightThumbMoved)
                break
        }
    }

    resetCurrentlySlidingOnNextMouseUp = (handler: (event: MouseEvent) => void) => {
        const mouseUpHandler = () => {
            this.currentlySliding = undefined
            document.removeEventListener("mouseup", mouseUpHandler)
            document.removeEventListener("mousemove", handler)
        }
        document.addEventListener("mouseup", mouseUpHandler)
    }

    handleLeftThumbMoved = (event: MouseEvent) => {
        const updates = updateLeftThumb({
            deltaX: event.movementX,
            thumbScreenX: this.leftThumb.nativeElement.getBoundingClientRect().x,
            thumbRadius: this.thumbRadius,
            otherThumbScreenX: this.rightThumb.nativeElement.getBoundingClientRect().x,
            sliderBoundingClientRectX: this.sliderContainer.nativeElement.getBoundingClientRect().x,
            sliderWidth: this.sliderWidth,
            minValue: this.minValue,
            maxValue: this.maxValue
        })
        this.sliderRangePosition = {
            leftEnd: updates.updatedThumbX,
            rightStart: this.sliderRangePosition.rightStart
        }
        this.upcomingLeftValue = updates.upcomingValue
        this.changeDetectorRef.markForCheck()
        this.handleValueChange({ newLeftValue: updates.upcomingValue })
    }

    handleRightThumbMoved = (event: MouseEvent) => {
        const updates = updateRightThumb({
            deltaX: event.movementX,
            thumbScreenX: this.rightThumb.nativeElement.getBoundingClientRect().x,
            thumbRadius: this.thumbRadius,
            otherThumbScreenX: this.leftThumb.nativeElement.getBoundingClientRect().x,
            sliderBoundingClientRectX: this.sliderContainer.nativeElement.getBoundingClientRect().x,
            sliderWidth: this.sliderWidth,
            minValue: this.minValue,
            maxValue: this.maxValue
        })
        this.sliderRangePosition = {
            leftEnd: this.sliderRangePosition.leftEnd,
            rightStart: updates.updatedThumbX
        }
        this.upcomingRightValue = updates.upcomingValue
        this.changeDetectorRef.markForCheck()
        this.handleValueChange({ newRightValue: updates.upcomingValue })
    }

    handleLeftThumbKeydown(event: KeyboardEvent) {
        const newLeftValue = this.calculateValueFromKeyboard(event, this.currentLeftValue, this.minValue, this.currentRightValue)
        if (newLeftValue === undefined || newLeftValue === this.currentLeftValue) {
            return
        }
        event.preventDefault()
        this.handleValueChange({ newLeftValue })
    }

    handleRightThumbKeydown(event: KeyboardEvent) {
        const newRightValue = this.calculateValueFromKeyboard(event, this.currentRightValue, this.currentLeftValue, this.maxValue)
        if (newRightValue === undefined || newRightValue === this.currentRightValue) {
            return
        }
        event.preventDefault()
        this.handleValueChange({ newRightValue })
    }

    private calculateValueFromKeyboard(event: KeyboardEvent, currentValue: number, lowerBound: number, upperBound: number) {
        let newValue: number
        switch (event.key) {
            case "ArrowLeft":
            case "ArrowDown":
                newValue = currentValue - 1
                break
            case "ArrowRight":
            case "ArrowUp":
                newValue = currentValue + 1
                break
            case "Home":
                newValue = lowerBound
                break
            case "End":
                newValue = upperBound
                break
            default:
                return undefined
        }
        return Math.max(lowerBound, Math.min(upperBound, newValue))
    }

    handleCurrentLeftInputChanged($event: Event) {
        const newLeftValue = parseChangedNumberInput($event, this.minValue, this.currentRightValue, this.currentLeftValue)
        if (newLeftValue === undefined) {
            return
        }
        this.handleValueChange({ newLeftValue })
    }

    handleCurrentRightInputChanged($event: Event) {
        const newRightValue = parseChangedNumberInput($event, this.currentLeftValue, this.maxValue, this.currentRightValue)
        if (newRightValue === undefined) {
            return
        }
        this.handleValueChange({ newRightValue })
    }
}
