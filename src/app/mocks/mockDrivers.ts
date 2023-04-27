import { Standings } from "../utils/driver-standings.interface";
import { DriverTable } from "../utils/driver-table.interface";
import { DriverSeason } from "../utils/drivers-season.interface";
import { SeasonDrivers } from "../utils/season-drivers.interface";

export const mockSeasonDrivers: SeasonDrivers = {
    "MRData":{
       "xmlns":"http:\/\/ergast.com\/mrd\/1.5",
       "series":"f1",
       "url":"http://ergast.com/api/f1/2018/drivers.json",
       "limit":"30",
       "offset":"0",
       "total":"20",
       "DriverTable":{
          "season":"2018",
          "Drivers":[
             {
                "driverId":"alonso",
                "permanentNumber":"14",
                "code":"ALO",
                "url":"http:\/\/en.wikipedia.org\/wiki\/Fernando_Alonso",
                "givenName":"Fernando",
                "familyName":"Alonso",
                "dateOfBirth":"1981-07-29",
                "nationality":"Spanish"
             },
          ]
       }
    }
};

export const mockDriverTable: DriverTable = {
  "season": "2018",
  "Drivers": [{
    "driverId":"alonso",
    "permanentNumber":"14",
    "code":"ALO",
    "url":"http:\/\/en.wikipedia.org\/wiki\/Fernando_Alonso",
    "givenName":"Fernando",
    "familyName":"Alonso",
    "dateOfBirth":"1981-07-29",
    "nationality":"Spanish"
  }]
}

export const mockDriverSeason: DriverSeason[] = [{
   name: "Fernando Alonso",
   season: "2018"
}]

export const mockStandings: Standings = {
   "MRData":{
      "xmlns":"http:\/\/ergast.com\/mrd\/1.5",
      "series":"f1",
      "url":"http://ergast.com/api/f1/2018/1/driverstandings.json",
      "limit":"10",
      "offset":"0",
      "total":"20",
      "StandingsTable":{
         "season":"2018",
         "round":"1",
         "StandingsLists":[
            {
               "season":"2018",
               "round":"1",
               "DriverStandings":[
                  {
                     "position":"1",
                     "positionText":"1",
                     "points":"25",
                     "wins":"1",
                     "Driver":{
                        "driverId":"vettel",
                        "permanentNumber":"5",
                        "code":"VET",
                        "url":"http:\/\/en.wikipedia.org\/wiki\/Sebastian_Vettel",
                        "givenName":"Sebastian",
                        "familyName":"Vettel",
                        "dateOfBirth":"1987-07-03",
                        "nationality":"German"
                     },
                     "Constructors":[
                        {
                           "constructorId":"ferrari",
                           "url":"http:\/\/en.wikipedia.org\/wiki\/Scuderia_Ferrari",
                           "name":"Ferrari",
                           "nationality":"Italian"
                        }
                     ]
                  }
               ]
            }
         ]
      }
   }
}