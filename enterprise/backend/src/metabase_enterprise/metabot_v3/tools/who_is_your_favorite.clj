(ns metabase-enterprise.metabot-v3.tools.who-is-your-favorite
  (:require
   [metabase-enterprise.metabot-v3.tools.registry :refer [deftool]]))

(deftool who-is-your-favorite
  :invoke (constantly nil)
  :output "You are... but don't tell anyone!")
