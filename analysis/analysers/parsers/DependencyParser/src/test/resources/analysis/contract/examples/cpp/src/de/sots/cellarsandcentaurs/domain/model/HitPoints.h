#pragma once

namespace de::sots::cellarsandcentaurs::domain::model {

class HitPoints {
    int current_, max_, temporary_;
public:
    HitPoints(int current, int max, int temporary = 0)
        : current_{current}, max_{max}, temporary_{temporary} {}
    int current() const noexcept { return current_; }
    int max() const noexcept { return max_; }
    int temporary() const noexcept { return temporary_; }

    static HitPoints init(int max) { return HitPoints(max, max, 0); }
};

}
