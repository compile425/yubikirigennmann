FROM ruby:3.4.3

RUN apt-get update -qq && apt-get install -y build-essential default-mysql-client libmariadb-dev libyaml-dev nodejs npm
RUN npm install -g yarn

WORKDIR /app

COPY Gemfile* /app/
RUN bundle install

ENV PATH /app/bin:/usr/local/bundle/bin:$PATH

COPY . /app