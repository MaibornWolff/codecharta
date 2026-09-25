#pragma once

#include <map>
#include <optional>
#include <string>
#include <vector>

namespace de::sots::cellarsandcentaurs::adapter::persistence {

template <typename T>
class Repository {
public:
    virtual ~Repository() = default;

    void save(const std::string& id, const T& item) { items_[id] = item; }

    std::optional<T> findOne(const std::string& id) const {
        auto found = items_.find(id);
        if (found == items_.end()) {
            return std::nullopt;
        }
        return found->second;
    }

    std::vector<T> findAll() const {
        std::vector<T> all;
        for (const auto& [id, item] : items_) {
            all.push_back(item);
        }
        return all;
    }

private:
    std::map<std::string, T> items_;
};

}
