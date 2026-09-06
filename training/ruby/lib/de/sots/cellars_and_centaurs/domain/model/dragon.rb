# frozen_string_literal: true

module De::Sots::CellarsAndCentaurs::Domain::Model
  class Dragon
    prepend LairBonus

    def initiative
      10
    end
  end
end
