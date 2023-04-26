import { StatusValue } from "../utils/status.interface";
import { Status } from "../utils/status.interface";

export const mockStatus: Status = {
  "MRData":{
     "xmlns":"http:\/\/ergast.com\/mrd\/1.5",
     "series":"f1",
     "url":"http://ergast.com/api/f1/2018/13/status.json",
     "limit":"30",
     "offset":"0",
     "total":"5",
     "StatusTable":{
        "season":"2018",
        "round":"13",
        "Status":[
           {
              "statusId":"1",
              "count":"9",
              "status":StatusValue.finished
           },
           {
              "statusId":"3",
              "count":"3",
              "status":StatusValue.accident
           },
           {
              "statusId":"11",
              "count":"6",
              "status":StatusValue.plus1Lap
           }
        ]
     }
  }
}