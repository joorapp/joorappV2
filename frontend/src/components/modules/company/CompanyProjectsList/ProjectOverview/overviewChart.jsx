import React from "react";
import PropTypes from "prop-types";
import { Card, CardBody, CardTitle } from "reactstrap";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../../../common/ChartsDynamicColor";
import { useTranslation } from "react-i18next";

const OverviewChart = ({ dataColors, seriesData, categories }) => {
  const { t } = useTranslation();
  const apexOverviewColors = getChartColorsArray(dataColors);

  const safeSeriesData = Array.isArray(seriesData) ? seriesData : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  if (safeSeriesData.length === 0 || safeCategories.length === 0) {
    return (
      <Card>
        <CardBody>
          <CardTitle className="mb-4">Overview</CardTitle>
          <div className="text-center py-4 text-muted">{t("Common.noDataAvailable")}</div>
        </CardBody>
      </Card>
    );
  }

  const options = {
    chart: {
      height: 290,
      type: "bar",
      toolbar: {
        show: !1,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "14%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: !1,
    },
    series: [
      {
        name: "Overview",
        data: safeSeriesData,
      },
    ],
    grid: {
      yaxis: {
        lines: {
          show: !1,
        },
      },
    },
    yaxis: {
      title: {
        text: "% (Percentage)",
      },
    },
    xaxis: {
      labels: {
        rotate: -90,
      },
      categories: safeCategories,
      title: {
        text: "Week",
      },
    },
    colors: apexOverviewColors,
  };

  const series = [
    {
      name: "Overview",
      data: safeSeriesData,
    },
  ];

  return (
    <Card>
      <CardBody>
        <CardTitle className="mb-4">Overview</CardTitle>
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height="290"
          className="apex-charts"
        />
      </CardBody>
    </Card>
  );
};

OverviewChart.propTypes = {
  options: PropTypes.object,
  series: PropTypes.array,
  seriesData: PropTypes.array,
  categories: PropTypes.array,
};

export default OverviewChart;
