import { createLogger, transports, Logger } from "winston";
import { Creatures } from "./Creatures";
import { Creature } from "../model/Creature";

export class CreatureService {
    private readonly logger: Logger = createLogger({ transports: [new transports.Console()] });

    constructor(private readonly creatures: Creatures) {}

    save(creature: Creature): void {
        this.logger.info(`saving creature ${creature.getId().id}`);
        this.creatures.save(creature);
    }
}
