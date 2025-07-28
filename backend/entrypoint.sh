#!/bin/bash
set -e

until mysql -h"$DB_HOST" -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1; do
  echo "Waiting for MySQL..."
  sleep 2
done

bundle exec rails db:prepare

exec "$@"
