import { AppElements as ae } from "../support/elements/app-elements";

context("Test the overall app", () => {
  beforeEach(() => {
    cy.visit("");
  });

  describe("Desktop functionalities", () => {
    it("renders with text", () => {
      // Check if the text includes "Location"
      ae.getApp().should("contain.text", "Location");
    });
  });
});
