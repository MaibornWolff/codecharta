#pragma once

namespace de::sots::cellarsandcentaurs::domain::model {

class Speed {
public:
    explicit Speed(int feetPerRound) : feetPerRound_{feetPerRound} {}

    int getFeetPerRound() const noexcept { return feetPerRound_; }
    void setFeetPerRound(int feetPerRound) noexcept { feetPerRound_ = feetPerRound; }

private:
    int feetPerRound_;
};

}
