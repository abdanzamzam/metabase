(ns metabase-enterprise.metabot-v3.client-test
  (:require
   [clojure.test :refer :all]
   [metabase-enterprise.metabot-v3.client :as metabot-v3.client]
   [metabase-enterprise.metabot-v3.tools :as metabot-v3.tools]))

(deftest ^:parallel build-request-body-test
  (binding [metabot-v3.client/*instance-info* (constantly {})
            metabot-v3.tools/*tools-metadata* (constantly
                                               [{:name :invite-user
                                                 :description "Invite a user to Metabase. Requires a valid email address."
                                                 :parameters {:type                  :object
                                                              :properties            {:email {:type        :string
                                                                                              :description "A valid email address of the user to invite"}}
                                                              :required              [:email]
                                                              :additional-properties false}}])]
    (is (= {:messages      [{:role :user, :content "Hello"}]
            :context       {}
            :tools         [{:name        :invite-user
                             :description "Invite a user to Metabase. Requires a valid email address."
                             :parameters  {:type       :object
                                           :properties {"email" {:type :string
                                                                 :description "A valid email address of the user to invite"}}
                                           :required   ["email"]
                                           :additionalProperties false}}]
            :instance_info {}}
           (#'metabot-v3.client/build-request-body "Hello" {} [])))))

(deftest ^:parallel encode-request-body-test
  (is (= {:messages [{:content    nil
                      :role       :assistant
                      :tool_calls [{:id "call_xsI6ygzaTnANYVxcmoAiRLRL"
                                    :name :say-hello
                                    :arguments "{\"name\":\"User\",\"greeting\":\"Hello!\"}"}]}]
          :context    {}}
         (#'metabot-v3.client/encode-request-body
          {:messages [{:content     nil
                       :role        :assistant
                       :tool-calls [{:id "call_xsI6ygzaTnANYVxcmoAiRLRL"
                                     :name :say-hello
                                     :arguments {:name "User", :greeting "Hello!"}}]}]}))))

(deftest ^:parallel decode-response-body-test
  (is (= {:message {:content    nil
                    :role       :assistant
                    :tool-calls [{:id        "call_1drvrXfHb6q9Doxh8leujqKB"
                                  :name      :say-hello
                                  :arguments {:name "User"
                                              :greeting "Hello!"}}]}}
         (#'metabot-v3.client/decode-response-body
          {:message {:content nil
                     :role "assistant"
                     :tool_calls [{:id "call_1drvrXfHb6q9Doxh8leujqKB"
                                   :name "say-hello"
                                   :arguments "{\"name\":\"User\",\"greeting\":\"Hello!\"}"}]}}))))

(deftest ^:parallel add-placeholder-tool-call-results-entries-test
  (is (= [{:content nil
           :role :assistant
           :tool-calls [{:id "call_1drvrXfHb6q9Doxh8leujqKB"
                         :name :say-hello
                         :arguments {:name "User", :greeting "Hello!"}}]}
          {:role :tool
           :tool-call-id "call_1drvrXfHb6q9Doxh8leujqKB"
           :content "success"}]
         (#'metabot-v3.client/add-placeholder-tool-call-results-entries
          [{:content    nil
            :role       :assistant
            :tool-calls [{:id        "call_1drvrXfHb6q9Doxh8leujqKB"
                          :name      :say-hello
                          :arguments {:name "User"
                                      :greeting "Hello!"}}]}]))))
