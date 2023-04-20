import { PaginationControls } from "./pagination-controls.interface";

export class GlobalConstants {
  static seasons = [2018, 2019, 2020, 2021, 2022];

  static defaultPagination: PaginationControls = {
    page: 1,
    itemsQty: 10,
    start: 0,
    end: 10
  };
}
