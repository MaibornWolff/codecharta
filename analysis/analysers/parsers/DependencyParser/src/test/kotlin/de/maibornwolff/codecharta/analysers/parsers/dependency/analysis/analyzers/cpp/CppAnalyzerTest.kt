package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeOfUsage
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class CppAnalyzerTest {
    @Test
    fun `should extract constructed type from each C++ constructor invocation form`() {
        // Arrange
        val cppCode = """

class Foo{

    // 1. Default constructor
    Alpha a;
    
    // 2. Parameterized constructor
    Beta b(42, "hello");
    
    // 3. Copy constructor
    Gamma g(b);
    
    // 4. Move constructor
    Delta d(std::move(b));
    
    // 5. Dynamic allocation (default)
    Epsilon* e = new Epsilon;
    
    // 6. Dynamic allocation (parameterized)
    Zeta* z = new Zeta(99, "world");
    
    // 7. Dynamic allocation (copy)
    Eta* eta = new Eta(a);
    
    // 8. List initialization (C++11)
    Theta t{1, "list"};
    
    // 9. Uniform initialization (C++11)
    Iota i = Iota{5, "uniform"};
    
    // 10. Placement new
    char buffer[sizeof(Kappa)];
    Kappa* k = new (buffer) Kappa(7, "placement");
    
    // 11. Array of objects
    Lambda arr[3] = { Lambda(), Lambda(1, "a"), Lambda(2, "b") };
};

        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(
                Type.simple("Alpha"),
                Type.simple("Beta"),
                Type.simple("Gamma"),
                Type.simple("Delta"),
                Type.simple("Epsilon"),
                Type.simple("Zeta"),
                Type.simple("Eta"),
                Type.simple("Theta"),
                Type.simple("Iota"),
                Type.simple("Kappa"),
                Type.simple("Lambda")
            )
        )
    }

    @Test
    fun `should keep generic-wrapped target type nested when constructing via smart pointer`() {
        // Arrange
        val cppCode = """
class Foo {
    std::unique_ptr<UniqueTarget> uptr = std::make_unique<UniqueTarget>(123, "smart");
    std::shared_ptr<SharedTarget> sptr = std::make_shared<SharedTarget>(456, "shared");
};
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert — the wrapped target type is recorded inside the smart-pointer's generics,
        // not as a standalone entry; resolution-time flattening is the resolver's job.
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).contains(
            Type.generic("unique_ptr", listOf(Type.simple("UniqueTarget"))),
            Type.generic("shared_ptr", listOf(Type.simple("SharedTarget")))
        )
        assertThat(usedTypes).noneMatch { it == Type.simple("UniqueTarget") }
        assertThat(usedTypes).noneMatch { it == Type.simple("SharedTarget") }
    }

    @Test
    fun `should recognize type of static function call correctly`() {
        // Arrange
        val cppCode = """
inline bool Address::doSomething() {
    return Assembler::is_uimm12(offset >> shift);
}
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first { it.name() == "Address" }.usedTypes
        assertThat(usedTypes).contains(
            Type.simple("Assembler")
        )
    }

    @Test
    fun `should recognize types of function parameters correctly`() {
        // Arrange
        val cppCode = """
inline bool Address::offset_ok_for_immed(int64_t offset, uint shift) {
}
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first { it.name() == "Address" }.usedTypes
        assertThat(usedTypes).containsAll(
            listOf(
                Type.simple("int64_t"),
                Type.simple("uint")
            )
        )
    }

    @Test
    fun `should set path of node to file path with file name if there is no namespace it resides in`() {
        // Arrange
        val cppCode = """
            class Foo {
                // This class is just a placeholder to test the include statement
            };
        """.trimIndent()

        // Act
        val report =
            CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./foo/bar/classes/DummyClasses.cpp", cppCode)).analyze()

        // Assert
        assertThat(report.nodes.first().pathWithName).isEqualTo(Path.fromStringWithDots("foo.bar.classes.DummyClasses_cpp.Foo"))
    }

    @Test
    fun `should set path of node to namespace if there is a namespace it resides in`() {
        // Arrange
        val cppCode = """
            namespace de::maibornwolff::codecharta::analysers::parsers::dependency::analysis {
                class DummyClass {
                    // This class is just a placeholder to test the include statement
                };
            }
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./foo/bar/classes", cppCode)).analyze()

        // Assert
        assertThat(
            report.nodes.first().pathWithName
        ).isEqualTo(Path.fromStringWithDots("de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.DummyClass"))
    }

    @Test
    fun `should recognize include statements with file path as dependencies`() {
        // Arrange
        val cppCode = """
            #include "dir/subdir/CreatureRepository.h"
            #include"dir/subdir/AnotherCreatureRepository.h"
            
            class DummyClass {
                // This class is just a placeholder to test the include statement
            };
        """
        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()
        // Assert
        assertThat(report.nodes.first().dependencies).contains(
            Dependency(Path.fromStringWithDots("dir.subdir.CreatureRepository_h"), isWildcard = false),
            Dependency(Path.fromStringWithDots("dir.subdir.AnotherCreatureRepository_h"), isWildcard = false)
        )
    }

    @Test
    fun `should set path of node to namespace it resides in, even when namespace is nested`() {
        // Arrange
        val cppCode = """
            namespace de::maibornwolff::codecharta::analysers::parsers::dependency::analysis {
                class FooClass {
                };
                namespace analyzers {
                    class BarClass {
                    };
                }
            }
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        assertThat(
            report.nodes.first().pathWithName
        ).isEqualTo(Path.fromStringWithDots("de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.FooClass"))
        assertThat(
            report.nodes[1].pathWithName
        ).isEqualTo(Path.fromStringWithDots("de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.BarClass"))
    }

    @Test
    fun `should handle nested namespaces`() {
        // Arrange
        val cppCode = """
            namespace de::maibornwolff::codecharta::analysers::parsers::dependency {
                namespace analysis {
                    namespace analyzers {
                        class DummyClass {
                        };
                    }
                }
            }
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        assertThat(
            report.nodes.first().pathWithName
        ).isEqualTo(Path.fromStringWithDots("de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.DummyClass"))
    }

    /*
    Add tests that takle all possible include statement variations of c++
     */
    @Test
    fun `should recognize include statements with angle brackets`() {
        // Arrange
        val cppCode = """
                #include <vector>
                #include <myproject/MyHeader.h>
                #include <boost/algorithm/string.hpp>
                #include<no_space.h>
                    
                class DummyClass {
                    // This class is just a placeholder to test the include statement
                };
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        val dependencies = report.nodes
            .first()
            .dependencies
            .map { it.path.toString() }
        assertThat(dependencies).containsAll(
            listOf(
                "vector",
                "myproject.MyHeader_h",
                "boost.algorithm.string_hpp",
                "no_space_h"
            )
        )
    }

    @Test
    fun `should recognize multiline include statements`() {
        // Arrange
        val cppCode = """
                #include "dir/subdir/CreatureRepository.h"
                #include "dir/\
                    subdir/AnotherCreatureRepository.h"

                class DummyClass {
                    // This class is just a placeholder to test the include statement
                };
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        assertThat(report.nodes.first().dependencies).contains(
            Dependency(Path.fromStringWithDots("dir.subdir.CreatureRepository_h"), isWildcard = false),
            Dependency(Path.fromStringWithDots("dir.subdir.AnotherCreatureRepository_h"), isWildcard = false)
        )
    }

    @Test
    fun `should extract types from templated class fields and method bodies`() {
        // Arrange
        val cppCode = """
           #include "CreatureRepository.h"

// Since CreatureRepository is an interface, it's typically implemented by a derived class.
// For example purposes, here's a possible implementation:

#include <unordered_set>

namespace de::sots::cellarsandcentaurs::adapter::persistence {

template<typename TEntity, typename TKey>
class ConcreteCreatureRepository : public CreatureRepository<TEntity, TKey> {
private:
    std::unordered_set<std::shared_ptr<TEntity>> entities;

public:
    std::set<std::shared_ptr<TEntity>> Entities() const override {
        return std::set<std::shared_ptr<TEntity>>(entities.begin(), entities.end());
    }
/*
    std::shared_ptr<TEntity> Find(const TKey& id) override {
        for (const auto& entity : entities) {
            if (entity->Id == id) {
                return entity;
            }
        }
        return nullptr;
    }

    void Add(const std::shared_ptr<TEntity>& entity) override {
        entities.insert(entity);
    }

    void Update(const std::shared_ptr<TEntity>& entity) override {
        Remove(entity);
        Add(entity);
    }

    void Remove(const std::shared_ptr<TEntity>& entity) override {
        entities.erase(entity);
    }
    */
};

} // namespace de::sots::cellarsandcentaurs::adapter::persistence

// It's mandatory to provide implementations for model classes 
// such as TEntity with uuid_t as the Id member, similar to the CreatureEntity class.
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        val sharedPtr = Type.generic("shared_ptr", listOf(Type.simple("TEntity")))

        assertThat(usedTypes).containsAll(
            listOf(
                Type.generic("unordered_set", listOf(sharedPtr)),
                Type.generic("set", listOf(sharedPtr))
            )
        )
    }

    @Test
    fun `should extract types from a multi-method implementation file`() {
        // Arrange
        val cppCode = """
           #include "PersistedCreatures.h"

namespace de::sots::cellarsandcentaurs::adapter::persistence {

PersistedCreatures::PersistedCreatures(std::shared_ptr<CreatureRepository<CreatureEntity, std::string>> repository)
    : repository(repository) {}

void PersistedCreatures::Save(const Creature& creature) {
    repository->Add(std::make_shared<CreatureEntity>(creature.GetId().GetId()));
}

Creature PersistedCreatures::Find(const CreatureId& id) {
    auto creatureEntity = repository->Find(id.GetId());
    if (!creatureEntity) {
        throw NoSuchCreatureException(id);
    }
    return Creature(CreatureId(creatureEntity->Id));
}

} // namespace de::sots::cellarsandcentaurs::adapter::persistence
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(
                Type.generic(
                    "shared_ptr",
                    listOf(
                        Type.generic(
                            "CreatureRepository",
                            listOf(
                                Type.simple("CreatureEntity"),
                                Type.simple("string")
                            )
                        )
                    )
                ),
                Type.generic("make_shared", listOf(Type.simple("CreatureEntity"))),
                Type.simple("Creature"),
                Type.simple("void"),
                Type.simple("CreatureId")
            )
        )
    }

    @Test
    fun `should extract constructor parameter types correctly`() {
        // Arrange
        val cppCode = """
        #include "Creature.h"

using namespace de::sots::cellarsandcentaurs::application;
namespace de::sots::cellarsandcentaurs::domain::model {

Creature::Creature(const std::string& name,
                   CreatureType type,
                   const HitPoints& hitPoints,
                   const ArmorClass& armorClass,
                   const std::unordered_map<SpeedType, Speed>& speeds)
    : name(name), type(CreatureFacade::STANDARD_CREATURE_TYPE), hitPoints(hitPoints), armorClass(armorClass), speeds(speeds) {}

std::string Creature::GetName() const {
    return name;
}

void Creature::SetName(const std::string& name) {
    this->name = name;
}

CreatureType Creature::GetType() const {
    return type;
}

void Creature::SetType(CreatureType type) {
    this->type = type;
}

HitPoints Creature::GetHitPoints() const {
    return hitPoints;
}

void Creature::SetHitPoints(const HitPoints& hitPoints) {
    this->hitPoints = hitPoints;
}

ArmorClass Creature::GetArmorClass() const {
    return armorClass;
}

void Creature::SetArmorClass(const ArmorClass& armorClass) {
    this->armorClass = armorClass;
}

Speed Creature::GetSpeed(SpeedType speedType) const {
    auto it = speeds.find(speedType);
    if (it != speeds.end()) {
        return it->second;
    }
    // Handle the case where the speedType is not found, throw exception or return a default value
    return Speed(); // Assuming Speed has a default constructor
}

void Creature::SetSpeed(SpeedType speedType, const Speed& speed) {
    speeds[speedType] = speed;
}

} // namespace de::sots::cellarsandcentaurs::domain::model
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(
                Type.simple("string", typeOfUsage = TypeOfUsage.ARGUMENT),
                Type.simple("CreatureType", typeOfUsage = TypeOfUsage.ARGUMENT),
                Type.simple("HitPoints", typeOfUsage = TypeOfUsage.ARGUMENT),
                Type.simple("ArmorClass", typeOfUsage = TypeOfUsage.ARGUMENT),
                Type.simple("CreatureFacade", typeOfUsage = TypeOfUsage.ARGUMENT),
                Type.simple("void", typeOfUsage = TypeOfUsage.ARGUMENT),
                Type.simple("SpeedType", typeOfUsage = TypeOfUsage.ARGUMENT),
                Type.simple("Speed", typeOfUsage = TypeOfUsage.ARGUMENT),
                Type.generic(
                    "unordered_map",
                    listOf(
                        Type.simple("SpeedType"),
                        Type.simple("Speed")
                    ),
                    typeOfUsage = TypeOfUsage.ARGUMENT
                )
            )
        )
    }

    @Test
    fun `should recognize unsigned statement as unsigned`() {
        // Arrange
        val cppCode = """
            class A {
                unsigned foo() {}
            }
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        assertEquals(
            report.nodes
                .first()
                .usedTypes
                .first()
                .name,
            "unsigned"
        )
    }

    @Test
    fun `should recognize signed statement as signed`() {
        // Arrange
        val cppCode = """
            class B {
                signed bar() {}
            }
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        assertEquals(
            report.nodes
                .first()
                .usedTypes
                .first()
                .name,
            "signed"
        )
    }

    @Test
    fun `should recognize type declared inside of class as own node and with namespace of declared class`() {
        // Arrange
        val cppCode = """
            class B {
                enum Foo {
                    BAR,
                    BAZ
                };
            }
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        assertThat(report.nodes.map { it.name() }).containsExactlyInAnyOrder("Foo", "B")
        val fooNode = report.nodes.first { it.name() == "Foo" }
        assertThat(fooNode.pathWithName.withoutName().last()).isEqualTo("B")
    }

    /**
     * Header and .cpp variants of the same class currently produce different
     * `pathWithName` values (`cli.executor_h.Executor` vs `cli.executor_cpp.Executor`),
     * so ProcessingPipeline.mergeIdenticalTypes never unites them and the .cpp's
     * out-of-class usedTypes never reach the header's node.
     */
    @org.junit.jupiter.api.Disabled(".h and .cpp declarations don't merge — documented for future fix")
    @Test
    fun `should produce matching pathWithName for class declared in header and its implementation file`() {
        // Arrange — header declares the class; .cpp defines an out-of-class method for it.
        val headerCode = """
            class Executor {
                Executor(const Settings& settings);
            };
        """.trimIndent()
        val implCode = """
            Executor::Executor(const Settings& settings) {}
        """.trimIndent()

        // Act
        val headerReport = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "cli/executor.h", headerCode)).analyze()
        val implReport = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "cli/executor.cpp", implCode)).analyze()

        // Assert
        val headerExecutor = headerReport.nodes.single { it.name() == "Executor" }
        val implExecutor = implReport.nodes.single { it.name() == "Executor" }
        assertThat(implExecutor.pathWithName)
            .`as`("header and implementation files must produce the same pathWithName so ProcessingPipeline.mergeDuplicates can unite them")
            .isEqualTo(headerExecutor.pathWithName)
    }
}
