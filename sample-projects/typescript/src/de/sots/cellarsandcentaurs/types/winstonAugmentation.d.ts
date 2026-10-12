import "winston";

declare module "winston" {
    interface Logger {
        creatureContext?: string;
    }
}
