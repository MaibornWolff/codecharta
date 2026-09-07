import "./logging.js";
import { rollD20 } from "../domain/model/Dice";

export function bootstrap() {
    return rollD20();
}
