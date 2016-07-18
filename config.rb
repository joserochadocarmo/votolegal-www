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


# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", locals: {
#  which_fake_page: "Rendering a fake page with a local variable" }

# General configuration

# Reload the browser automatically whenever files change
configure :development do
  # api host address
  # config[:api_host] = "http://127.0.0.1:3000/api"
  #config[:api_host] = "//45.55.50.43/api"
  config[:api_host] = "//192.168.1.39:3000/api/"

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

# Build-specific configuration
configure :build do
  # api host address
  config[:api_host] = "/api"

  # webapp host address
  config[:host] = "//www.votolegal.org.br"

  # Append a hash to asset urls (make sure to use the url helpers)
  #activate :asset_hash
  activate :asset_hash do |opts|
    # ignore email header
    opts.ignore = /email\/header\.jpg/i
  end

  # Minify CSS on build
  activate :minify_css

  # Minify Javascript on build
  activate :minify_javascript
end
