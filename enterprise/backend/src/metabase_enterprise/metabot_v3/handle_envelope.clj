(ns metabase-enterprise.metabot-v3.handle-envelope
  "Code for handling responses from AI Proxy ([[metabase-enterprise.metabot-v3.client]])."
  (:require
   [metabase-enterprise.metabot-v3.client :as metabot-v3.client]
   [metabase-enterprise.metabot-v3.envelope :as envelope]
   [metabase-enterprise.metabot-v3.tools.interface :as metabot-v3.tools.interface]
   [metabase.util :as u]
   [metabase.util.o11y :as o11y]))

(defn- invoke-all-tool-calls! [e]
  (reduce (fn [e {tool-name :name, tool-call-id :id, :keys [arguments]}]
            (let [result (promise)
                  {:keys [reactions output]}
                  (o11y/with-span :info {:name tool-name}
                    (u/prog1 (metabot-v3.tools.interface/*invoke-tool* tool-name (assoc arguments :metabot-v3/tool-call-id tool-call-id))
                      (deliver result <>)))]
              (envelope/add-tool-response e tool-call-id output reactions)))
          e
          (envelope/tool-calls-requiring-invocation e)))

(defn- request-llm-response [e]
  (let [new-response-message (:message (metabot-v3.client/*request* (envelope/context e)
                                                                    (envelope/history e)))]
    (-> e
        envelope/decrement-round-trips
        (envelope/add-message new-response-message))))

(defn handle-envelope
  "Three possible states here:
  1. *We* have updated the history with a tool call response, and require an LLM response.
  2. We have received a response back from the LLM and need to respond to tool calls (if any)
  3. We don't need to do anything at all."
  [e]
  (cond
    (envelope/requires-tool-invocation? e) (recur (invoke-all-tool-calls! e))
    (envelope/requires-llm-response? e) (recur (request-llm-response e))
    :else e))