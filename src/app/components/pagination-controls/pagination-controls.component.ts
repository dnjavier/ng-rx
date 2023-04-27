import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GlobalConstants } from 'src/app/utils/global-constants';
import { PaginationControls } from 'src/app/utils/pagination-controls.interface';

@Component({
  selector: 'app-pagination-controls',
  templateUrl: './pagination-controls.component.html',
  styleUrls: ['./pagination-controls.component.scss']
})
export class PaginationControlsComponent {

  private itemsQty = GlobalConstants.defaultPagination.itemsQty;

  @Input() itemsLength: number | undefined;
  @Input() currentPage!: number | null | undefined;
  @Input() isMorePages!: boolean | null;
  @Input() isLoadingData = false;
  @Output() controlsChanged = new EventEmitter<PaginationControls>();

  constructor() {}

  /**
   * Emits a new items quantity number thorugh the Output
   * as part of the pagination controls and restart page number.
   * 
   * @param itemsQty - Items quantity to be emitted
   */
  onItemsQtyChanged(itemsQty: number): void {
    this.itemsQty = itemsQty;
    this.controlsChanged.emit({
      // restart page
      page: GlobalConstants.defaultPagination.page,
      itemsQty,
      start: GlobalConstants.defaultPagination.start,
      end: itemsQty
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
   * Calculates the next page number based on the
   * currentPage value, and validates maximum of pages
   * is not exceeded.
   */
  nextPage(): void {
    if (this.currentPage && this.itemsLength && !this.isLoadingData) {
      // rounded up
      const maxPage = Math.ceil(this.itemsLength / this.itemsQty);

      if (this.currentPage < maxPage) {
        this.onPageChanged(this.currentPage + 1);
      }
    } else if (this.isMorePages && this.currentPage && !this.isLoadingData) {
      this.onPageChanged(this.currentPage + 1);
    }
  }

  /**
   * Emits a new page number with its start and end section
   * in the array thorugh the Output as part of the pagination
   * controls and send the current itemsQty.
   * 
   * @param page - Page number to be emitted
   */
  private onPageChanged(page: number): void {
    this.controlsChanged.emit({
      page,
      itemsQty: this.itemsQty,
      start: this.itemsQty * (page - 1),
      end: this.itemsQty * page
    });
  }
}
