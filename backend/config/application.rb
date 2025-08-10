require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module App
  class Application < Rails::Application
    config.load_defaults 7.2

    config.eager_load_paths << Rails.root.join("lib")

    config.api_only = true
  end
end
