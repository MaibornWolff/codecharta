import React from "react";
import type { Speed } from "../../domain/model/Speed";

type SpeedBadgeProps = {
    speed: Speed;
};

export const SpeedBadge = ({ speed }: SpeedBadgeProps): React.JSX.Element => (
    <span className="speed-badge" title="Galloping pace">
        {speed.getSpeed() > 30 ? "fast" : "slow"}
    </span>
);
