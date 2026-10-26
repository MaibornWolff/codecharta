import * as Generator from './generator'

export class View {
    render(): Generator.Layout {
        Generator.createNodes()
        return new Generator.Layout()
    }
}
