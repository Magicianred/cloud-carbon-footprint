/*
 * © 2021 ThoughtWorks, Inc.
 */

import express from 'express'

import {
  App,
  CreateValidRequest,
  EstimationRequestValidationError,
  PartialDataError,
  CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
  Logger,
  RawRequest,
} from '@cloud-carbon-footprint/core'

export type EmissionsRatios = {
  region: string
  mtPerKwHour: number
}

const apiLogger = new Logger('api')

/**
 * Returns the raw estimates
 *
 * Query params:
 * start - Required, UTC start date in format YYYY-MM-DD
 * end - Required, UTC start date in format YYYY-MM-DD
 */
const FootprintApiMiddleware = async function (
  req: express.Request,
  res: express.Response,
): Promise<void> {
  // Set the request time out to 10 minutes to allow the request enough time to complete.
  req.socket.setTimeout(1000 * 60 * 10)
  const rawRequest: RawRequest = {
    startDate: req.query.start?.toString(),
    endDate: req.query.end?.toString(),
  }
  apiLogger.info(
    `Footprint API request started with Start Date: ${rawRequest.startDate} and End Date: ${rawRequest.endDate}`,
  )
  const footprintApp = new App()
  try {
    const estimationRequest = CreateValidRequest(rawRequest)
    const estimationResults = await footprintApp.getCostAndEstimates(
      estimationRequest,
    )
    res.json(estimationResults)
  } catch (e) {
    apiLogger.error(`Unable to process footprint request.`, e)
    if (e instanceof EstimationRequestValidationError) {
      res.status(400).send(e.message)
    } else if (e instanceof PartialDataError) {
      res.status(416).send(e.message)
    } else res.status(500).send('Internal Server Error')
  }
}

const EmissionsApiMiddleware = async function (
  req: express.Request,
  res: express.Response,
): Promise<void> {
  apiLogger.info(`Regions emissions factors API request started`)
  try {
    const emissionsResults: EmissionsRatios[] = Object.values(
      CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
    ).reduce((cloudProviderResult, cloudProvider) => {
      return Object.keys(cloudProvider).reduce((emissionDataResult, key) => {
        cloudProviderResult.push({
          region: key,
          mtPerKwHour: cloudProvider[key],
        })
        return emissionDataResult
      }, cloudProviderResult)
    }, [])
    res.json(emissionsResults)
  } catch (e) {
    apiLogger.error(`Unable to process regions emissions factors request.`, e)
    res.status(500).send('Internal Server Error')
  }
}

const router = express.Router()

router.get('/footprint', FootprintApiMiddleware)
router.get('/regions/emissions-factors', EmissionsApiMiddleware)

export default router
