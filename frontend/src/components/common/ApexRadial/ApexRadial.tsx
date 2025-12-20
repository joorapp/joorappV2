import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import getChartColorsArray from "../ChartsDynamicColor";

interface ApexRadialProps {
  dataColors: string;
}

const ApexRadial: React.FC<ApexRadialProps> = ({ dataColors }) => {
  const apexRadialColors = getChartColorsArray(dataColors);

  const series = [67];
  const options: ApexOptions = {
    chart: {
      type: 'radialBar' as const,
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          size: '70%',
        },
        dataLabels: {
          show: true,
          name: {
            show: false,
            fontSize: "13px",
            color: void 0,
            offsetY: 60,
          },
          value: {
            show: true,
            offsetY: 50,
            fontSize: "18px",
            fontWeight: 500,
            color: "#adb5bd",
            formatter: function (e: number) {
              return e + "%";
            },
          },
        },
      },
    },
    colors: apexRadialColors,
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        shadeIntensity: 0.15,
        inverseColors: !1,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 65, 91],
      },
    },
    stroke: {
      dashArray: 4,
    },
    labels: ["Series A"],
  };
  return (
    <ReactApexChart
      options={options}
      series={series}
      type="radialBar"
      height="200"
      className="apex-charts"
    />
  );
};

export default ApexRadial;
