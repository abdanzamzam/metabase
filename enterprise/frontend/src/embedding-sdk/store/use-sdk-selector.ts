import { useContext } from "react";
import type { TypedUseSelectorHook } from "react-redux";

import type { SdkStoreState } from "embedding-sdk/store/types";
import { MetabaseReduxContext, useSelector } from "metabase/lib/redux";

// eslint-disable-next-line no-literal-metabase-strings -- this string only shows in the console.
export const USE_OUTSIDE_OF_CONTEXT_MESSAGE = `Hooks from the Metabase Embedding SDK must be used within a component wrapped by the MetabaseProvider`;

export const useSdkSelector: TypedUseSelectorHook<SdkStoreState> = (
  selector,
  options,
) => {
  const context = useContext(MetabaseReduxContext);

  if (!context) {
    throw new Error(USE_OUTSIDE_OF_CONTEXT_MESSAGE);
  }

  // @ts-expect-error -- TODO: fix
  return useSelector(selector, options);
};
