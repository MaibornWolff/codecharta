# frozen_string_literal: true

backend_file = ENV.fetch('CREATURE_BACKEND', 'creature_repository')
require File.join(__dir__, backend_file)
