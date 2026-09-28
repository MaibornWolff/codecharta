#pragma once

namespace de::sots::cellarsandcentaurs::domain::model {

class Speed {
    int speed_;
public:
    explicit Speed(int speed) : speed_{speed} {}
    int getSpeed() const noexcept { return speed_; }
    void setSpeed(int speed) noexcept { speed_ = speed; }
};

}
