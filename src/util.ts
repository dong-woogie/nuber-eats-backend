import * as haversine from 'haversine';

export function getDistance({ lat, lng }, point: any) {
  const distance = haversine(
    {
      latitude: lat,
      longitude: lng,
    },
    {
      latitude: point.coordinates[0],
      longitude: point.coordinates[1],
    },
  ).toFixed(3);
  return +distance;
}
