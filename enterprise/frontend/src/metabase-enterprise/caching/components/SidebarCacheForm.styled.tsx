import styled from "@emotion/styled";

import { Group } from "metabase/ui";

export const SidebarCacheFormBody = styled(Group)`
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  .form-buttons-group {
    border-top: 1px solid var(--mb-color-border);
    position: sticky;
    bottom: 0;
  }
  .strategy-form-box {
    border-bottom: 0 !important;
  }
  .strategy-form-submit-button {
    flex-grow: 1;
  }
`;
