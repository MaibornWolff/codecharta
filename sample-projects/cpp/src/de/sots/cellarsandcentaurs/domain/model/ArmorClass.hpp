#pragma once

#include <string>

namespace de::sots::cellarsandcentaurs::domain::model {

class ArmorClass {
public:
    ArmorClass(int base, int bonus);
    ArmorClass(int base, int bonus, std::string description);

    int getBase() const noexcept { return base_; }
    void setBase(int base) noexcept;
    int getBonus() const noexcept { return bonus_; }
    void setBonus(int bonus) noexcept;
    int getTotal() const noexcept { return total_; }
    const std::string& getDescription() const noexcept { return description_; }

private:
    std::string description_;
    int base_;
    int bonus_;
    int total_;
};

}
