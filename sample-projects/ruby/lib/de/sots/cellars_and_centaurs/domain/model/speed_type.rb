# frozen_string_literal: true

require_relative '../../version'

module De::Sots::CellarsAndCentaurs::Domain::Model
  module SpeedType
    WALKING = :walking
    FLYING = :flying
    SWIMMING = :swimming
    BURROWING = :burrowing
    CLIMBING = :climbing

    ALL = [WALKING, FLYING, SWIMMING, BURROWING, CLIMBING].freeze
  end
end
