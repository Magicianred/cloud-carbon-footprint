/*
 * © 2021 ThoughtWorks, Inc.
 */

import { StorageEstimator } from '../StorageEstimator'
import FootprintEstimate from '../FootprintEstimate'
import { AWS_REGIONS } from '../../services/aws/AWSRegions'

describe('StorageEstimator', () => {
  const SSD_COEFFICIENT = 1.2
  const HDD_COEFFICIENT = 0.65

  describe('estimating a single SSD result', () => {
    const estimator: StorageEstimator = new StorageEstimator(SSD_COEFFICIENT)

    const results: FootprintEstimate[] = estimator.estimate(
      [
        {
          terabyteHours: 1.0,
          timestamp: new Date('1998-01-01'),
        },
      ],
      AWS_REGIONS.US_EAST_1,
      'AWS',
    )

    it('creates one estimate', () => {
      expect(results.length).toEqual(1)
    })

    it('uses the start date of the time period as the timestamp', () => {
      expect(results[0].timestamp).toEqual(new Date('1998-01-01T00:00:00Z'))
    })

    it('calculates the wattage of an SSD using its terabyteHours usage for the start date of the time period', () => {
      expect(results[0].kilowattHours).toEqual(0.001362)
    })

    it('calculates the co2 emissions based on the wattage and us wattage carbon for the start date of the time period', () => {
      expect(results[0].co2e).toEqual(6.19029e-7)
    })
  })

  describe('estimating a single HDD result', () => {
    const estimator: StorageEstimator = new StorageEstimator(HDD_COEFFICIENT)

    const results: FootprintEstimate[] = estimator.estimate(
      [
        {
          terabyteHours: 1.0,
          timestamp: new Date('1998-01-01'),
        },
      ],
      AWS_REGIONS.US_EAST_1,
      'AWS',
    )

    it('creates one estimate', () => {
      expect(results.length).toEqual(1)
    })

    it('uses the start date of the time period as the timestamp', () => {
      expect(results[0].timestamp).toEqual(new Date('1998-01-01T00:00:00Z'))
    })

    it('calculates the wattage of an SSD using its Terabyte Hours of usage for the start date of the time period', () => {
      expect(results[0].kilowattHours).toEqual(0.00073775)
    })

    it('calculates the co2 emissions based on the wattage and us wattage carbon for the start date of the time period', () => {
      expect(results[0].co2e).toEqual(3.35307375e-7)
    })
  })

  describe('estimating multiple results', () => {
    it('provides one result for each SSD input', () => {
      const estimator: StorageEstimator = new StorageEstimator(SSD_COEFFICIENT)

      const results = estimator.estimate(
        [
          {
            terabyteHours: 1.0,
            timestamp: new Date('2008-01-01'),
          },
          {
            terabyteHours: 2.0,
            timestamp: new Date('1998-01-01'),
          },
        ],
        AWS_REGIONS.US_EAST_1,
        'AWS',
      )

      expect(results).toEqual([
        {
          co2e: 6.19029e-7,
          timestamp: new Date('2008-01-01T00:00:00.000Z'),
          kilowattHours: 0.001362,
        },
        {
          co2e: 0.000001238058,
          timestamp: new Date('1998-01-01T00:00:00.000Z'),
          kilowattHours: 0.002724,
        },
      ])
    })

    it('provides one result for each HDD input', () => {
      const estimator: StorageEstimator = new StorageEstimator(HDD_COEFFICIENT)

      const results = estimator.estimate(
        [
          {
            terabyteHours: 1.0,
            timestamp: new Date('2008-01-01'),
          },
          {
            terabyteHours: 2.0,
            timestamp: new Date('1998-01-01'),
          },
        ],
        AWS_REGIONS.US_EAST_1,
        'AWS',
      )

      expect(results).toEqual([
        {
          co2e: 3.35307375e-7,
          timestamp: new Date('2008-01-01T00:00:00.000Z'),
          kilowattHours: 0.00073775,
        },
        {
          co2e: 6.7061475e-7,
          timestamp: new Date('1998-01-01T00:00:00.000Z'),
          kilowattHours: 0.0014755,
        },
      ])
    })
  })
})
