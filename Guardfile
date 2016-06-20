# A sample Guardfile
# More info at https://github.com/guard/guard#readme

## Uncomment and set this to only include directories you want to watch
directories %w(includes css js sass img) \
  .select{|d| Dir.exists?(d) ? d : UI.warning("Directory #{d} does not exist")}

## Note: if you are using the `directories` clause above and you are not
## watching the project directory ('.'), then you will want to move
## the Guardfile to a watched dir and symlink it back, e.g.
#
#  $ mkdir config
#  $ mv Guardfile config/
#  $ ln -s config/Guardfile .
#
# and, you'll have to watch "config/Guardfile" instead of "Guardfile"

guard 'livereload' do
  extensions = {
    css: :css,
    scss: :css,
    sass: :css,
    js: :js,
    coffee: :js,
    html: :html,
    png: :png,
    gif: :gif,
    jpg: :jpg,
    jpeg: :jpeg,
    # less: :less, # uncomment if you want LESS stylesheets done in browser
  }

  view_exts = %w(html htm php php5 tmpl)

  # file types LiveReload may optimize refresh for
  compiled_exts = extensions.values.uniq
  watch(%r{(css|js|img)/.+\.(#{compiled_exts * '|'})})

  watch(%r{.+\.(#{view_exts * '|'})$})
  watch(%r{includes/.+\.(#{view_exts * '|'})$})
end

############################
## LiveReload usage
############################
## Install:
# - Firefox Add-on
#   https://addons.mozilla.org/en-US/firefox/addon/livereload/?src=ss
#
# - Ruby gem
#   gem install guard-livereload
#
#
## Running:
# $ guard
