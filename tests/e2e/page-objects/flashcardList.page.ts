import type { Page, Locator } from "@playwright/test";

export class FlashcardListPage {
  readonly page: Page;
  readonly list: Locator;
  readonly saveAllButton: Locator;
  readonly errorAlert: Locator;
  readonly getCard: (index: number) => Locator;
  readonly getFront: (index: number) => Locator;
  readonly getBack: (index: number) => Locator;
  readonly getEditButton: (index: number) => Locator;
  readonly getRejectButton: (index: number) => Locator;
  readonly rejectDialog: Locator;
  readonly rejectDialogCancel: Locator;
  readonly rejectDialogConfirm: Locator;
  readonly bulkSaveDialog: Locator;
  readonly bulkSaveDialogCancel: Locator;
  readonly bulkSaveDialogConfirm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.list = page.getByTestId("flashcard-list");
    this.saveAllButton = page.getByTestId("flashcard-list-save-all");
    this.errorAlert = page.getByTestId("flashcard-list-error");
    this.getCard = (i: number) => page.getByTestId(`flashcard-card-${i}`);
    this.getFront = (i: number) => page.getByTestId(`flashcard-front-${i}`);
    this.getBack = (i: number) => page.getByTestId(`flashcard-back-${i}`);
    this.getEditButton = (i: number) => page.getByTestId(`flashcard-edit-button-${i}`);
    this.getRejectButton = (i: number) => page.getByTestId(`flashcard-reject-button-${i}`);
    this.rejectDialog = page.getByTestId("flashcard-reject-dialog");
    this.rejectDialogCancel = page.getByTestId("alert-dialog-cancel");
    this.rejectDialogConfirm = page.getByTestId("flashcard-reject-dialog-confirm");
    this.bulkSaveDialog = page.getByTestId("flashcard-bulk-save-dialog");
    this.bulkSaveDialogCancel = page.getByTestId("flashcard-bulk-save-dialog-cancel");
    this.bulkSaveDialogConfirm = page.getByTestId("flashcard-bulk-save-dialog-confirm");
  }

  async saveAll() {
    await this.saveAllButton.click();
  }

  async confirmBulkSave() {
    await this.bulkSaveDialogConfirm.click();
  }

  async cancelBulkSave() {
    await this.bulkSaveDialogCancel.click();
  }

  async rejectCard(index: number) {
    await this.getRejectButton(index).click();
  }

  async confirmReject() {
    await this.rejectDialogConfirm.click();
  }

  async cancelReject() {
    await this.rejectDialogCancel.click();
  }

  async editCard(index: number) {
    await this.getEditButton(index).click();
  }
}
