
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
}