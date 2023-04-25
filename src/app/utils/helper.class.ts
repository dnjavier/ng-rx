import { BehaviorSubject } from "rxjs";
import { GlobalConstants } from "./global-constants";
import { PaginationControls } from "./pagination-controls.interface";
import { Standings } from "./driver-standings.interface";

export class Helper {
  static readonly lastSeason = GlobalConstants.seasons[GlobalConstants.seasons.length - 1];

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

  /**
   * Based on the previous rounds and positions
   * determines if season needs to be incremented.
   * 
   * @param controls Pagination controls
   * @returns season
   */
  static calcSeason(totalRounds: string, lastRound: string, lastPosition: string, totalPositions: string, actualSeason: number): number {
    let season = actualSeason;
    const lastSeason = GlobalConstants.seasons[GlobalConstants.seasons.length - 1];
    if (lastRound === totalRounds &&
        lastPosition === totalPositions &&
        actualSeason < lastSeason) {
      return season + 1;
    }
    return season;
  }

  /**
   * Based on the data returned by the API, update
   * the isPendingDataSubject accordingly.
   *
   * @param data
   */
  static updatePendingData(
      seasonTotalRounds: string, 
      subject: BehaviorSubject<boolean>, 
      dataList: any[],
      roundRequested: string,
      seasonRequested: string,
      totalLastRequest: string): void {
    const lastSeason = GlobalConstants.seasons[GlobalConstants.seasons.length - 1];
    const lastPosition = dataList[dataList.length - 1].position;

    if (seasonRequested === lastSeason + '' &&
        roundRequested === seasonTotalRounds &&
        totalLastRequest === lastPosition) {
      subject.next(false);
    } else {
      const existingValue = subject.getValue();
      if (!existingValue) {
        subject.next(true);
      }
    }
  }
}