##
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false
page '/admin/signin/index.html', layout: false

# With alternative layout
# page "/path/to/file.html", layout: :otherlayout
page "/admin/*.html", :layout => :admin
page "/candidato/*.html", :layout => :candidato
page '/error/config-error/index.html', layout: false


# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", locals: {
#  which_fake_page: "Rendering a fake page with a local variable" }

# General configuration

# Reload the browser automatically whenever files change
configure :development do
  # api host address
  config[:api_host] = "//45.55.50.43/api"

  # webapp host address
  config[:host] = "//www.votolegal.org.br"

  activate :livereload
end

###
# Helpers
###

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end


# Sprockets
activate :sprockets do |c|
  c.expose_middleman_helpers = true
end

# Build-specific configuration
configure :build do
  # api host address
  config[:api_host] = "/api"
  #puts ("*" * 12) + "- MUDAR HOST DA API PARA PRODUÇÃO"
  #config[:api_host] = "//45.55.50.43/api"

  # webapp host address
  config[:host] = "//www.votolegal.org.br"

  # Append a hash to asset urls (make sure to use the url helpers)
  #activate :asset_hash
  activate :asset_hash do |opts|
    # ignore email headers
    opts.ignore = /email\/header\.jpg/i
  end

  activate :minify_html, remove_input_attributes: false
  activate :minify_css
  activate :minify_javascript
end
