#pragma once
#include <string>

namespace de::sots::cellarsandcentaurs::domain::model {

class ArmorClass {
    std::string description_;
    int base_ = 0;
    int bonus_ = 0;
    int total_ = 0;
public:
    ArmorClass(int base, int bonus);
    ArmorClass(int base, int bonus, const std::string& description);

    int getBase() const noexcept;
    void setBase(int base) noexcept;

    int getBonus() const noexcept;
    void setBonus(int bonus) noexcept;

    int getTotal() const noexcept;
    void setTotal(int total) noexcept;

    const std::string& getDescription() const noexcept;
    void setDescription(const std::string& description);
};

}
