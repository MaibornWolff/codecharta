import { provideZonelessChangeDetection } from "@angular/core"
import { bootstrapApplication } from "@angular/platform-browser"
import { CodeChartaComponent } from "app/codeCharta/codeCharta.component"
import { appConfig } from "app/app.config"

bootstrapApplication(CodeChartaComponent, { ...appConfig, providers: [provideZonelessChangeDetection(), ...appConfig.providers] })
