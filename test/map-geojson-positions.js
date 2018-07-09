import { assert } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import {
  mapGeojsonPositions
} from '../dist/traverse-geojson'
import fs from 'fs-extra'
import path from 'path'
import { positionsOf } from 'gjtk'
import deepFreeze from 'deep-freeze'

describe('mapGeojsonPositions function', () => {
  const dataDir = path.resolve(__dirname, './data')
  const sampleFileNames = [
    'feat-col.json',
    'feat-linestring.json',
    'feat-polygon.json',
    'geom.json',
    'coords.json',
    'ring.json',
    'position.json'
  ]

  const [
    workingSample1
  ] = sampleFileNames

  it('should be defined', () => {
    assert.ok(mapGeojsonPositions)
  })

  describe('Generic test with multiple samples', () => {
    sampleFileNames.forEach(fileName => {
      it(`shouldn't throw with ${fileName}`, () => {
        const inputGeojson = fs.readJsonSync(path.resolve(dataDir, fileName), 'UTF-8')
        assert.doesNotThrow(mapGeojsonPositions.bind(null, inputGeojson, position => position))
      })

      it(`shouldn't mutate argument object with ${fileName}`, () => {
        const inputGeojson = fs.readJsonSync(path.resolve(dataDir, fileName), 'UTF-8')
        deepFreeze(inputGeojson)
        assert.doesNotThrow(mapGeojsonPositions.bind(null, inputGeojson, position => position))
      })

      it(`should return same type as initial with ${fileName}`, () => {
        const inputGeojson = fs.readJsonSync(path.resolve(dataDir, fileName), 'UTF-8')
        const parsedGeojson = mapGeojsonPositions(inputGeojson, position => position)

        assert.ok(parsedGeojson)

        if (inputGeojson.type) {
          assert.propertyVal(parsedGeojson, 'type', inputGeojson.type)
        } else {
          assert.notProperty(parsedGeojson, 'type')
        }
      })

      it(`should respect positions mapper with ${fileName}`, () => {
        const inputGeojson = fs.readJsonSync(path.resolve(dataDir, fileName), 'UTF-8')

        const transformer = (([lng, lat]) => (['test', 'retest']))

        const parsedGeojson = mapGeojsonPositions(inputGeojson, transformer)

        if (!Array.isArray(parsedGeojson)) {
          const positions = positionsOf(parsedGeojson)
          assert.isNotEmpty(positions)
          assert(
            positions.every(([lng, lat]) => lng === 'test' && lat === 'retest'),
            'Every position is transformed'
          )
        }// Else no time to deeply find coordinates, sorry
      })
    })
  })
})
