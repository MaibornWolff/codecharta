import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    effect,
    inject,
    input,
    OnDestroy,
    output,
    signal,
    viewChild
} from "@angular/core"
import { toObservable, toSignal } from "@angular/core/rxjs-interop"
import { switchMap } from "rxjs"
import { DomainWord } from "../../../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudSettings, WordCloudShape } from "../../../../model/wordCloud.model"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { WordCloudChartRegistry } from "../../services/wordCloudChart.registry"
import { WordCloudReadStore } from "../../stores/wordCloud.read.store"
import { selectTopWords } from "../../util/topWords"
import { loadWordCloudMaskImage } from "../../util/wordCloudMask"
import { buildWordCloudOption } from "../../util/wordCloudOption.builder"
import { WordCloudChartHost } from "./wordCloudChartHost"
import { describeDroppedWords, describeWordCloud, SCREEN_READER_WORD_COUNT } from "./wordCloudDescription"

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

@Component({
    selector: "cc-word-cloud",
    templateUrl: "./wordCloud.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    host: { class: "relative block h-full w-full" }
})
export class WordCloudComponent implements OnDestroy {
    private readonly wordCloudReadStore = inject(WordCloudReadStore)
    private readonly viewReadinessStore = inject(ViewReadinessStore)

    readonly settings = input<WordCloudSettings>(defaultWordCloudSettings)

    readonly selectedNodePath = input<string | null>(null)

    readonly clearSelection = output<void>()

    private readonly canvasRef = viewChild<ElementRef<HTMLElement>>("wordCloudCanvas")

    private readonly chartHost = new WordCloudChartHost(inject(WordCloudChartRegistry), () => this.viewReadinessStore.markReady("domain"))

    protected readonly words = toSignal(
        toObservable(this.selectedNodePath).pipe(switchMap(path => this.wordCloudReadStore.wordsForSelectedNode(path))),
        { initialValue: [] as DomainWord[] }
    )
    protected readonly selectedNodeName = computed(() => this.wordCloudReadStore.selectedNodeName(this.selectedNodePath()))

    private readonly renderedWords = computed(() => selectTopWords(this.words(), this.settings().sizingMode, this.settings().topN))

    protected readonly droppedWordNotice = computed(() =>
        describeDroppedWords(this.chartHost.drawnWordCount(), this.renderedWords().length)
    )

    protected readonly topWordsForScreenReaders = computed(() => this.renderedWords().slice(0, SCREEN_READER_WORD_COUNT))

    protected readonly ariaLabel = computed(() => describeWordCloud(this.renderedWords(), this.selectedNodeName()))

    private readonly prefersReducedMotion = typeof matchMedia === "function" && matchMedia(REDUCED_MOTION_QUERY).matches

    private readonly maskImage = signal<HTMLImageElement | null>(null)

    constructor() {
        this.loadMaskImageAndKeepCircleFallbackOnFailure()
        effect(() => this.renderIntoTheChartOnceTheContainerIsMeasured())
    }

    ngOnDestroy(): void {
        this.chartHost.dispose()
    }

    protected showWholeMap(): void {
        this.clearSelection.emit()
    }

    private renderIntoTheChartOnceTheContainerIsMeasured(): void {
        const words = this.words()
        const settings = this.settings()
        const container = this.canvasRef()?.nativeElement
        if (!container) {
            this.chartHost.dispose()
            this.viewReadinessStore.markReady("domain")
            return
        }
        this.chartHost.attachTo(container)
        const { width: containerWidth, height: containerHeight } = this.chartHost.containerSize()
        if (containerWidth === 0 || containerHeight === 0) {
            return
        }
        this.chartHost.render(
            buildWordCloudOption(words, settings, {
                layoutAnimation: !this.prefersReducedMotion,
                containerWidth,
                maskImage: settings.shape === WordCloudShape.logoM ? (this.maskImage() ?? undefined) : undefined
            })
        )
    }

    private loadMaskImageAndKeepCircleFallbackOnFailure(): void {
        loadWordCloudMaskImage()
            .then(image => this.maskImage.set(image))
            .catch(() => undefined)
    }
}
