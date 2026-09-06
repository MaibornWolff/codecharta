#pragma once

namespace de::sots::cellarsandcentaurs::application {

class TreasureLedger {
    friend class CreatureUtil;

public:
    int getHoard() const noexcept { return hoard_; }

private:
    int hoard_ = 0;
};

}
