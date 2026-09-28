#pragma once

#include <algorithm>

namespace de::sots::cellarsandcentaurs::domain::model {

/**
 * Hit points drop when the creature takes damage and recover when it rests in its lair.
 */
class HitPoints {
public:
    static constexpr int MAX_HIT_POINTS = 999;

    HitPoints(int current, int max, int temporary = 0)
        : current_{current}, max_{std::min(max, MAX_HIT_POINTS)}, temporary_{temporary} {}

    static HitPoints init(int max) { return HitPoints(max, max, 0); }

    int getCurrent() const noexcept { return current_; }
    int getMax() const noexcept { return max_; }
    int getTemporary() const noexcept { return temporary_; }

    void takeDamage(int damage) noexcept { current_ = std::max(0, current_ - damage); }
    void rest() noexcept { current_ = max_; }

private:
    int current_;
    int max_;
    int temporary_;
};

}
