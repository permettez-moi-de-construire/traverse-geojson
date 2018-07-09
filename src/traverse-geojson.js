import { isPosition } from 'gjtk'

function cheapIsOneOfTypes (maybeGeometry, types) {
  return (
    maybeGeometry &&
    maybeGeometry.type &&
    typeof maybeGeometry.type === 'string' &&
    types.includes(maybeGeometry.type)
  )
}

function cheapIsGeojson (maybeGeometry) {
  const geojsonTypes = [
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon',
    'GeometryCollection',
    'Feature',
    'FeatureCollection'
  ]

  return cheapIsOneOfTypes(maybeGeometry, geojsonTypes)
}

function cheapIsGeometry (maybeGeometry, avoidGeometryCollection = false) {
  const geometryTypes = [
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon',
    ...(avoidGeometryCollection ? [] : ['GeometryCollection'])
  ]

  return cheapIsOneOfTypes(maybeGeometry, geometryTypes)
}

export function mapGeojsonPositions (geojson, positionTransformer) {
  if (!geojson || !cheapIsGeojson(geojson) || !positionTransformer) return geojson

  switch (geojson.type) {
    case 'Feature':
      return {
        ...geojson,
        geometry: mapGeojsonPositions(geojson.geometry, positionTransformer)
      }
    case 'FeatureCollection':
      return {
        ...geojson,
        features: geojson.features.map(
          feature => mapGeojsonPositions(feature, positionTransformer)
        )
      }
    case 'GeometryCollection':
      return {
        ...geojson,
        geometries: geojson.geometries.map(
          geometry => mapGeojsonPositions(geometry, positionTransformer)
        )
      }
    default:
      if (cheapIsGeometry(geojson, true)) {
        return {
          ...geojson,
          coordinates: mapCoordinatesPositions(geojson.coordinates, positionTransformer)
        }
      }
  }
}

export function mapCoordinatesPositions (geometryCoordinates, positionTransformer) {
  if (!Array.isArray(geometryCoordinates)) {
    throw new Error(`geometryCoordinates should be an instance of Array. (${typeof geometryCoordinates} given)`)
  }

  if (isPosition(geometryCoordinates)) {
    return positionTransformer(geometryCoordinates)
  }

  return geometryCoordinates.map(
    geometrySubCoordinates => mapCoordinatesPositions(geometrySubCoordinates, positionTransformer)
  )
}

export default {
  mapGeojsonPositions,
  mapCoordinatesPositions
}
