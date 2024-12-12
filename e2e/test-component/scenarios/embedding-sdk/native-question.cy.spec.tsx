import { StaticQuestion } from "@metabase/embedding-sdk-react";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import {
  createNativeQuestion,
  describeEE,
  tableInteractiveBody,
} from "e2e/support/helpers";
import {
  mockAuthProviderAndJwtSignIn,
  mountInteractiveQuestion,
  mountSdkContent,
  signInAsAdminAndEnableEmbeddingSdk,
} from "e2e/support/helpers/component-testing-sdk";
import type { DatasetColumn } from "metabase-types/api";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

describeEE("scenarios > embedding-sdk > native questions", () => {
  beforeEach(() => {
    signInAsAdminAndEnableEmbeddingSdk();

    createNativeQuestion(
      {
        native: {
          query: "SELECT * FROM orders WHERE {{ID}}",
          "template-tags": {
            ID: {
              id: "6b8b10ef-0104-1047-1e1b-2492d5954322",
              name: "ID",
              "display-name": "ID",
              type: "dimension",
              dimension: ["field", ORDERS.ID, null],
              "widget-type": "category",
              default: null,
            },
          },
        },
      },
      { wrapId: true },
    );

    cy.signOut();
    mockAuthProviderAndJwtSignIn();
  });

  it("supports passing sql parameters to interactive questions", () => {
    mountInteractiveQuestion({ initialSqlParameters: { ID: ORDERS_ID } });

    cy.wait("@cardQuery").then(({ response }) => {
      const { body } = response ?? {};

      const rows = tableInteractiveBody().findAllByRole("rowgroup");

      // There should be one row in the table
      rows.should("have.length", 1);

      const idColumnIndex = body.data.cols.findIndex(
        (column: DatasetColumn) => column.name === "ID",
      );

      // The first row should have the same ID column value as the initial SQL parameters
      rows
        .findAllByTestId("cell-data")
        .eq(idColumnIndex)
        .should("have.text", String(ORDERS_ID));
    });
  });

  it("supports passing sql parameters to static questions", () => {
    cy.intercept("GET", "/api/card/*").as("getCard");
    cy.intercept("POST", "/api/card/*/query").as("cardQuery");

    cy.get<number>("@questionId").then(questionId => {
      mountSdkContent(
        <StaticQuestion
          questionId={questionId}
          initialSqlParameters={{ ID: ORDERS_ID }}
        />,
      );
    });

    cy.wait("@getCard").then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
    });

    cy.wait("@cardQuery").then(({ response }) => {
      const { body } = response ?? {};

      const rows = tableInteractiveBody().findAllByRole("rowgroup");

      // There should be one row in the table
      rows.should("have.length", 1);

      const idColumnIndex = body.data.cols.findIndex(
        (column: DatasetColumn) => column.name === "ID",
      );

      // The first row should have the same ID column value as the initial SQL parameters
      rows
        .findAllByTestId("cell-data")
        .eq(idColumnIndex)
        .should("have.text", String(ORDERS_ID));
    });
  });
});
