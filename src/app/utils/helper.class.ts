import { PaginationControls } from "./pagination-controls.interface";

export class Helper {

  /**
   * Based on the existing data and the last round,
   * determines which is starting index for the next values
   * 
   * @returns starting index for the next set of results
   */
  static calcOffset(allStoredData: any[],
                    seasonRequested: number, latestRound: number): number {
    let offset = 0;
    const dataLastestRound = allStoredData.filter((data: any) => 
      Number(data.season) === seasonRequested && data.round === latestRound);
    if (dataLastestRound) {
      offset += dataLastestRound.length;
    }

    return offset;
  }

  /**
   * Based on the pagination controls and the
   * stored data, determines the new limit.
   * 
   * @param controls Pagination controls
   * @returns limit
   */
  static calcLimit(controls: PaginationControls, dataLengthLastRound: number): number {
    let limit = controls.itemsQty;
    if (controls.page === 1) {
      if (dataLengthLastRound && dataLengthLastRound < limit) {
        limit -= dataLengthLastRound;
      }
    }
    return limit;
  }
}