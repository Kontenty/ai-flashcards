import type { Page, Locator } from "@playwright/test";

export class ReviewsPage {
  readonly page: Page;
  readonly container: Locator;
  readonly startPanel: Locator;
  readonly startPanelLoading: Locator;
  readonly startButton: Locator;
  readonly cardPanel: Locator;
  readonly flipButton: Locator;
  readonly summaryPanel: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId("reviews-page");
    this.startPanelLoading = page.getByTestId("review-start-panel-loading");
    this.startPanel = page.getByTestId("review-start-panel");
    this.startButton = page.getByTestId("review-start-button");
    this.cardPanel = page.getByTestId("review-card-panel");
    this.flipButton = page.getByTestId("review-flip-button");
    this.summaryPanel = page.getByTestId("review-summary-panel");
    this.backButton = page.getByTestId("review-summary-back-button");
  }

  async goto() {
    await this.page.goto("/reviews");
  }

  async startSession() {
    await this.startButton.click();
  }

  async flipCard() {
    await this.flipButton.click();
  }

  async goBackToDashboard() {
    await this.backButton.click();
  }
}
