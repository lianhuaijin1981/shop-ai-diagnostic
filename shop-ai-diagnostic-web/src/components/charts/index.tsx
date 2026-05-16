import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { cn } from '@/utils'

interface RadarChartProps {
  data: {
    name: string
    value: number[]
    max?: number[]
  }
  indicators: string[]
  className?: string
}

export function RadarChart({ data, indicators, className }: RadarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    chartInstance.current = echarts.init(chartRef.current)

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
      },
      radar: {
        indicator: indicators.map((name, i) => ({
          name,
          max: data.max?.[i] || 100,
        })),
        shape: 'polygon',
        splitNumber: 4,
        axisName: {
          color: '#64748b',
          fontSize: 12,
        },
        splitLine: {
          lineStyle: {
            color: '#e2e8f0',
          },
        },
        splitArea: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: '#e2e8f0',
          },
        },
      },
      series: [
        {
          type: 'radar',
          data: [data],
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 2,
          },
          areaStyle: {
            opacity: 0.2,
          },
          emphasis: {
            lineStyle: {
              width: 3,
            },
            areaStyle: {
              opacity: 0.4,
            },
          },
        },
      ],
      color: ['#0ea5e9', '#22c55e', '#f59e0b'],
    }

    chartInstance.current.setOption(option)

    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [data, indicators])

  return <div ref={chartRef} className={cn('w-full h-full min-h-[300px]', className)} />
}

interface LineChartProps {
  data: {
    dates: string[]
    series: Array<{
      name: string
      data: number[]
    }>
  }
  className?: string
}

export function LineChart({ data, className }: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    chartInstance.current = echarts.init(chartRef.current)

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: data.series.map((s) => s.name),
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.dates,
        axisLabel: {
          color: '#64748b',
        },
        axisLine: {
          lineStyle: {
            color: '#e2e8f0',
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#64748b',
        },
        splitLine: {
          lineStyle: {
            color: '#f1f5f9',
          },
        },
      },
      series: data.series.map((s, i) => ({
        name: s.name,
        type: 'line',
        smooth: true,
        data: s.data,
        itemStyle: {
          color: ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'][i % 4],
        },
        areaStyle: {
          opacity: 0.1,
        },
      })),
    }

    chartInstance.current.setOption(option)

    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [data])

  return <div ref={chartRef} className={cn('w-full h-full min-h-[300px]', className)} />
}

interface BarChartProps {
  data: {
    categories: string[]
    series: Array<{
      name: string
      data: number[]
    }>
  }
  className?: string
}

export function BarChart({ data, className }: BarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    chartInstance.current = echarts.init(chartRef.current)

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: data.series.map((s) => s.name),
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.categories,
        axisLabel: {
          color: '#64748b',
          rotate: 30,
        },
        axisLine: {
          lineStyle: {
            color: '#e2e8f0',
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#64748b',
        },
        splitLine: {
          lineStyle: {
            color: '#f1f5f9',
          },
        },
      },
      series: data.series.map((s, i) => ({
        name: s.name,
        type: 'bar',
        data: s.data,
        itemStyle: {
          color: ['#0ea5e9', '#22c55e', '#f59e0b'][i % 3],
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '40%',
      })),
    }

    chartInstance.current.setOption(option)

    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [data])

  return <div ref={chartRef} className={cn('w-full h-full min-h-[300px]', className)} />
}

interface PieChartProps {
  data: Array<{
    name: string
    value: number
  }>
  className?: string
}

export function PieChart({ data, className }: PieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    chartInstance.current = echarts.init(chartRef.current)

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          data: data,
        },
      ],
      color: ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    }

    chartInstance.current.setOption(option)

    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [data])

  return <div ref={chartRef} className={cn('w-full h-full min-h-[300px]', className)} />
}
