export interface Circuit {
  Location: Location;
  circuitId: string;
  circuitName: string;
  url: string;
}

interface Location {
  country: string;
  lat: string;
  locality: string;
  long: string;
}