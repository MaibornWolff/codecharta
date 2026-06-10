import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
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
export class MetricColorRangeSliderComponent implements OnChanges, AfterViewInit, OnDestroy {
    @Input() minValue: number
    @Input() maxValue: number
    @Input() currentLeftValue: number
    @Input() currentRightValue: number
    @Input() leftColor: string
    @Input() middleColor: string
    @Input() rightColor: string
    @Input() handleValueChange: HandleValueChange
    /** Initial estimate; replaced by the measured track width once the slider is laid out. */
    @Input() sliderWidth = 150

    @ViewChild("rangeSliderContainer") sliderContainer: ElementRef<HTMLDivElement>
    @ViewChild("leftThumb") leftThumb: ElementRef<HTMLDivElement>
    @ViewChild("rightThumb") rightThumb: ElementRef<HTMLDivElement>

    sliderRangePosition: SliderRangePosition = { leftEnd: 0, rightStart: 0 }
    thumbRadius = 7
    actualSliderWidth = this.sliderWidth
    upcomingLeftValue: number
    upcomingRightValue: number

    private currentlySliding: CurrentlySliding = undefined
    private activeMouseMoveHandler: ((event: MouseEvent) => void) | null = null
    private activeMouseUpHandler: (() => void) | null = null
    private resizeObserver: ResizeObserver | undefined

    constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.sliderWidth) {
            this.actualSliderWidth = this.sliderWidth
        }
        if (!this.currentlySliding) {
            if (changes.currentLeftValue) {
                this.upcomingLeftValue = this.currentLeftValue
            }
            if (changes.currentRightValue) {
                this.upcomingRightValue = this.currentRightValue
            }
            this.updateSliderRangePosition()
        }
    }

    ngAfterViewInit() {
        // The track is fluid (flex-1 in a width-capped popover), so the width must be
        // measured instead of assumed; otherwise thumb math drifts on narrow viewports.
        if (typeof ResizeObserver !== "undefined") {
            this.resizeObserver = new ResizeObserver(entries => {
                const width = entries[entries.length - 1].contentRect.width
                if (width > 0 && width !== this.actualSliderWidth) {
                    this.actualSliderWidth = width
                    if (!this.currentlySliding) {
                        this.updateSliderRangePosition()
                    }
                    this.changeDetectorRef.markForCheck()
                }
            })
            this.resizeObserver.observe(this.sliderContainer.nativeElement)
        }
    }

    ngOnDestroy() {
        this.stopSliding()
        this.resizeObserver?.disconnect()
    }

    setCurrentlySliding(currentlySliding: CurrentlySliding) {
        this.stopSliding()
        this.currentlySliding = currentlySliding
        switch (this.currentlySliding) {
            case "leftThumb":
                this.activeMouseMoveHandler = this.handleLeftThumbMoved
                this.rightThumb.nativeElement.style.zIndex = "0"
                this.leftThumb.nativeElement.style.zIndex = "1"
                break

            case "rightThumb":
                this.activeMouseMoveHandler = this.handleRightThumbMoved
                this.leftThumb.nativeElement.style.zIndex = "0"
                this.rightThumb.nativeElement.style.zIndex = "1"
                break

            default:
                return
        }
        this.activeMouseUpHandler = () => this.stopSliding()
        document.addEventListener("mousemove", this.activeMouseMoveHandler)
        document.addEventListener("mouseup", this.activeMouseUpHandler)
    }

    private stopSliding() {
        this.currentlySliding = undefined
        if (this.activeMouseMoveHandler) {
            document.removeEventListener("mousemove", this.activeMouseMoveHandler)
            this.activeMouseMoveHandler = null
        }
        if (this.activeMouseUpHandler) {
            document.removeEventListener("mouseup", this.activeMouseUpHandler)
            this.activeMouseUpHandler = null
        }
    }

    handleLeftThumbMoved = (event: MouseEvent) => {
        if (this.abortSlidingWhenHidden()) {
            return
        }
        const updates = updateLeftThumb({
            deltaX: event.movementX,
            thumbScreenX: this.leftThumb.nativeElement.getBoundingClientRect().x,
            thumbRadius: this.thumbRadius,
            otherThumbScreenX: this.rightThumb.nativeElement.getBoundingClientRect().x,
            sliderBoundingClientRectX: this.sliderContainer.nativeElement.getBoundingClientRect().x,
            sliderWidth: this.actualSliderWidth,
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
        if (this.abortSlidingWhenHidden()) {
            return
        }
        const updates = updateRightThumb({
            deltaX: event.movementX,
            thumbScreenX: this.rightThumb.nativeElement.getBoundingClientRect().x,
            thumbRadius: this.thumbRadius,
            otherThumbScreenX: this.leftThumb.nativeElement.getBoundingClientRect().x,
            sliderBoundingClientRectX: this.sliderContainer.nativeElement.getBoundingClientRect().x,
            sliderWidth: this.actualSliderWidth,
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
        // step from the upcoming (possibly not yet committed) value: the committed input
        // lags behind the parent's debounce, so repeated presses must build on each other
        const newLeftValue = this.calculateValueFromKeyboard(event, this.upcomingLeftValue, this.minValue, this.upcomingRightValue)
        if (newLeftValue === undefined || newLeftValue === this.upcomingLeftValue) {
            return
        }
        event.preventDefault()
        this.upcomingLeftValue = newLeftValue
        this.updateSliderRangePosition()
        this.handleValueChange({ newLeftValue })
    }

    handleRightThumbKeydown(event: KeyboardEvent) {
        const newRightValue = this.calculateValueFromKeyboard(event, this.upcomingRightValue, this.upcomingLeftValue, this.maxValue)
        if (newRightValue === undefined || newRightValue === this.upcomingRightValue) {
            return
        }
        event.preventDefault()
        this.upcomingRightValue = newRightValue
        this.updateSliderRangePosition()
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
        const newLeftValue = parseChangedNumberInput($event, this.minValue, this.upcomingRightValue, this.upcomingLeftValue)
        if (newLeftValue === undefined) {
            return
        }
        this.upcomingLeftValue = newLeftValue
        this.updateSliderRangePosition()
        this.handleValueChange({ newLeftValue })
    }

    handleCurrentRightInputChanged($event: Event) {
        const newRightValue = parseChangedNumberInput($event, this.upcomingLeftValue, this.maxValue, this.upcomingRightValue)
        if (newRightValue === undefined) {
            return
        }
        this.upcomingRightValue = newRightValue
        this.updateSliderRangePosition()
        this.handleValueChange({ newRightValue })
    }

    private updateSliderRangePosition() {
        this.sliderRangePosition = calculateSliderRangePosition({
            minValue: this.minValue,
            maxValue: this.maxValue,
            currentLeftValue: this.upcomingLeftValue ?? this.currentLeftValue,
            currentRightValue: this.upcomingRightValue ?? this.currentRightValue,
            sliderWidth: this.actualSliderWidth
        })
    }

    private abortSlidingWhenHidden(): boolean {
        // a light-dismissed popover hides the slider mid-drag; its rects collapse to zero
        // and the drag math would dispatch a garbage color range near minValue
        if (this.sliderContainer.nativeElement.getBoundingClientRect().width === 0) {
            this.stopSliding()
            return true
        }
        return false
    }
}
