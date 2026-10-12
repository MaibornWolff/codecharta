import { SpeedType } from "../../domain/model/SpeedType.js";

export const SpeedBadge = ({ speedType, speed }) => (
    <span className="badge">
        {speedType === SpeedType.FLYING ? "flies" : "moves"} {speed.getSpeed()}
    </span>
);
