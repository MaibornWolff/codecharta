import Stats from 'three/examples/jsm/libs/stats.module';
import { WebGLInfo } from "three"
import { ThreeRendererService } from './threeRendererService';

export class ThreeStatsService {
	stats : Stats
    xPanel : Stats.Panel
	yPanel : Stats.Panel
	private maxXPanel = 0
    private maxYPanel = 0

    /* ngInject */
	constructor(
        private threeRendererService: ThreeRendererService
    ) {}

    init = (canvasElement: Element) => {
		const { stats = Stats() } = this
        
        this.xPanel = stats.addPanel( Stats.Panel( 'triangles', '#ff8', '#221' ) )
		this.yPanel = stats.addPanel( Stats.Panel( 'calls', '#f8f', '#212' ) )
		stats.showPanel( 3 )

		stats.domElement.style.position = 'absolute'
		stats.domElement.style.left = '0'
		stats.domElement.style.top = '0'
		canvasElement.appendChild( stats.dom )
    }

	updateStats = () => {
		const webGLInfo : WebGLInfo["render"] = this.threeRendererService.enableFXAA ? 
			this.threeRendererService.composer.getInfo() : 
			this.threeRendererService.renderer.info.render
		
		const triangles : number = webGLInfo.triangles
		this.maxXPanel = Math.max(this.maxXPanel,triangles)
		this.xPanel.update( triangles, this.maxXPanel*1.3 )

		const calls : number = webGLInfo.calls
		this.maxYPanel = Math.max(this.maxYPanel,calls)
		this.yPanel.update( calls, this.maxYPanel*1.3 )

		this.stats.update()
	}
}