import { NgModule } from '@angular/core'
import { SharedModule } from '../shared/shared.module'
import { CardComponent } from './card.component'

@NgModule({ declarations: [CardComponent], imports: [SharedModule] })
export class AppModule {}
