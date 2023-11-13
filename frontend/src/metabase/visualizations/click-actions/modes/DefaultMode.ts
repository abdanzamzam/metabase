import { AutomaticInsightsDrill } from "metabase/visualizations/click-actions/drills/AutomaticInsightsDrill";
import UnderlyingRecordsDrill from "metabase/visualizations/click-actions/drills/UnderlyingRecordsDrill";
import { QuickFilterDrill } from "metabase/visualizations/click-actions/drills/QuickFilterDrill";
import ZoomDrill from "metabase/visualizations/click-actions/drills/ZoomDrill";
import { ColumnFilterDrill } from "metabase/visualizations/click-actions/drills/ColumnFilterDrill";
import type { QueryClickActionsMode } from "../../types";
import { ColumnFormattingAction } from "../actions/ColumnFormattingAction";
import { HideColumnAction } from "../actions/HideColumnAction";
import { DashboardClickAction } from "../actions/DashboardClickAction";

export const DefaultMode: QueryClickActionsMode = {
  name: "default",
  clickActions: [
    UnderlyingRecordsDrill,
    ZoomDrill,
    QuickFilterDrill,
    ColumnFilterDrill,
    AutomaticInsightsDrill,
    HideColumnAction,
    ColumnFormattingAction,
    DashboardClickAction,
  ],
};
