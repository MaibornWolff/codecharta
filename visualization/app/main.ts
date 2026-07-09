import { provideZonelessChangeDetection } from "@angular/core"
import { bootstrapApplication } from "@angular/platform-browser"
import { appConfig } from "app/app.config"
import { CodeChartaComponent } from "app/codeCharta/views/codeCharta.component"

bootstrapApplication(CodeChartaComponent, { ...appConfig, providers: [provideZonelessChangeDetection(), ...appConfig.providers] })
