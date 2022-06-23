#!/bin/bash

${BASH_SOURCE%/*}/set_env_local.sh
bundle
JEKYLL_ENV=production bundle exec jekyll serve --livereload --trace
${BASH_SOURCE%/*}/set_env_ghpages.sh
