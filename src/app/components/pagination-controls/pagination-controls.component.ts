import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination-controls',
  templateUrl: './pagination-controls.component.html',
  styleUrls: ['./pagination-controls.component.scss']
})
export class PaginationControlsComponent {
  private itemsQty = 10; // lowest items qty by default

  @Input() itemsLength: number | undefined = this.itemsQty;
  @Input() currentPage!: number | null;
  @Output() controlsChanged = new EventEmitter<{page: number | null, itemsQty: number}>();

  /**
   * Emits a new items quantity number thorugh the Output
   * as part of the pagination controls and restart page number.
   * 
   * @param itemsQty - Items quantity to be emitted
   */
  onItemsQtyChanged(itemsQty: number): void {
    this.itemsQty = itemsQty;
    this.controlsChanged.emit({
      page: 1, // restart page
      itemsQty
    });
  }

  /**
   * CalculateS the previous page number based on the
   * currentPage value.
   */
  previousPage(): void {
    if (this.currentPage && this.currentPage > 1) {
      this.onPageChanged(this.currentPage - 1);
    }
  }

  /**
   * CalculateS the next page number based on the
   * currentPage value, and validates maximum of pages
   * is not exceeded.
   */
  nextPage(): void {
    if (this.currentPage && this.itemsLength) {
      // rounded up
      const maxPage = Math.ceil(this.itemsLength / this.itemsQty);

      if (this.currentPage < maxPage) {
        this.onPageChanged(this.currentPage + 1);
      }
    }
  }

  /**
   * Emits a new page number thorugh the Output as part
   * of the pagination controls and send the current itemsQty.
   * 
   * @param page - Page number to be emitted
   */
  private onPageChanged(page: number): void {
    this.controlsChanged.emit({
      page,
      itemsQty: this.itemsQty
    });
  }
}
