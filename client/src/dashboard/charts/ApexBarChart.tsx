/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { FunctionComponent, useState } from 'react'
import { useTheme } from '@material-ui/core/styles'
import Chart from 'react-apexcharts'

import { sumCO2, sumCO2ByServiceOrRegion } from '../transformData'
import { ApexChartProps } from './common/ChartTypes'

export const ApexBarChart: FunctionComponent<ApexChartProps> = ({ data, dataType }) => {
  const [page, setPage] = useState(0)
  const theme = useTheme()
  const chartColors = [theme.palette.primary.main]
  const barChartData = sumCO2ByServiceOrRegion(data, dataType)

  const dataEntries: { x: string; y: number }[] = Object.entries(barChartData)
    .filter((item) => item[1] > 0)
    .map((item) => ({
      x: item[0],
      y: item[1],
    }))
    .sort((higherC02, lowerCO2) => lowerCO2.y - higherC02.y)

  const paginatedData = []
  const newEntries = [...dataEntries]
  while (newEntries.length > 0) {
    const paginatedSubData = newEntries.splice(0, 10)
    paginatedData.push(paginatedSubData)
  }

  const options = {
    series: [
      {
        name: 'Total CO2e',
        data: paginatedData[page],
      },
    ],
    colors: chartColors,
    chart: {
      type: 'bar',
      toolbar: {
        tools: {
          download: null,
        },
      },
    },
    grid: {
      show: false,
      yaxis: {
        lines: {
          show: false,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      formatter: function (value: number) {
        return `${((value / sumCO2(data)) * 100).toFixed(2)} %`
      },
      offsetX: 10,
      background: {
        enabled: true,
        foreColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.dark,
        padding: 6,
        borderRadius: 1,
        borderWidth: 1,
        opacity: 0.9,
      },
    },
    xaxis: {
      type: 'category',
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '13px',
        },
      },
    },
    tooltip: {
      fillSeriesColor: false,
      x: {
        show: false,
      },
      y: {
        formatter: function (value: number) {
          return `${value.toFixed(3)} mt`
        },
      },
    },
    height: '500px',
  }

  const visibleRows = `${page * 10 + 1} - ${page * 10 + paginatedData[page]?.length}`
  const largestCO2E = dataEntries?.[0]?.y
  const smallestCO2E = dataEntries?.[dataEntries.length - 1]?.y
  const currentLargestOrPreviousShortestCO2E =
    page == 0 ? paginatedData[0]?.[0]?.y : paginatedData[page - 1]?.[paginatedData[page - 1]?.length - 1]?.y

  const map = (value: number, x1: number, y1: number, x2: number, y2: number) =>
    ((value - x1) * (y2 - x2)) / (y1 - x1) + x2

  const percent = map(currentLargestOrPreviousShortestCO2E, smallestCO2E, largestCO2E, 17, 100)
  console.log(currentLargestOrPreviousShortestCO2E)
  console.log(percent)
  return (
    <div>
      <Chart options={options} series={options.series} type="bar" height={options.height} width={`${percent}%`} />
      <div>
        <span>
          {visibleRows} of {dataEntries.length}
        </span>
        {page > 0 && <button onClick={() => setPage(page - 1)}>Prev</button>}
        {page < paginatedData.length - 1 && <button onClick={() => setPage(page + 1)}>Next</button>}
      </div>
    </div>
  )
}