import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

interface StackedColumnChartProps {
  periodData: Array<{
    name: string;
    data: number[];
  }>;
  dataColors?: string;
}

const StackedColumnChart: React.FC<StackedColumnChartProps> = ({ periodData, dataColors }) => {
  // Parse dataColors if provided as JSON string
  const colors = useMemo(() => {
    if (dataColors) {
      try {
        return JSON.parse(dataColors);
      } catch {
        return ['--bs-primary', '--bs-warning', '--bs-success'];
      }
    }
    return ['--bs-primary', '--bs-warning', '--bs-success'];
  }, [dataColors]);

  // Generate categories (months for now, can be adjusted based on period)
  const categories = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.slice(0, periodData[0]?.data.length || 12);
  }, [periodData]);

  const chartOptions: ApexOptions = {
    chart: {
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '15%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: categories,
    },
    yaxis: {
      title: {
        text: 'Clients',
      },
    },
    fill: {
      opacity: 1,
    },
    colors: colors.map((color: string) => {
      if (color.startsWith('--bs-')) {
        const colorMap: { [key: string]: string } = {
          '--bs-primary': '#564cf3',
          '--bs-warning': '#f1b44c',
          '--bs-success': '#34c38f',
        };
        return colorMap[color] || '#564cf3';
      }
      return color;
    }),
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + ' clients';
        },
      },
    },
  };

  const series = periodData.map((item) => ({
    name: item.name,
    data: item.data,
  }));

  return (
    <div id="stacked-column-chart">
      <Chart
        options={chartOptions}
        series={series}
        type="bar"
        height={350}
      />
    </div>
  );
};

export default StackedColumnChart;

