/**
 * The entry point
 */

import echarts from "echarts";
import { scatter3D } from "echarts-gl";
import WorldTopology from "./world.topo.bathy.200401.jpg";
import { aboutSection } from "./aboutSection.js";
import { returnDataSeries } from "./getData.js";
import "./style.css";

function produceOption(data) {
  return {
    visualMap: {
      textStyle: {
        color: "white"
      },
      pieces: [
        { min: 0, max: 10 },
        { min: 100, max: 1000 },
        { min: 1000, max: 10000, label: "1k - 10k" },
        { min: 10000, max: 100000, label: "10k - 100k" },
        { min: 100000, max: 1000000, label: "100k - 1M" },
        { min: 10000000, label: "1M+" }
      ],
      inRange: {
        color: [
          "rgba(245, 171, 53, 0.9)",
          "rgba(241, 90, 34, 0.9)",
          "rgba(240, 52, 52, 0.9)"
        ]
      },
      zlevel: 11
    },
    series: {
      type: "scatter3D",
      coordinateSystem: "globe",
      symbolSize: data => dataScaleCalculation(data[3]),
      label: {
        position: "top",
        formatter: params => {
          return `${params.name}:
  ${params.data.confirmed} cases
  ${params.data.recovered} recovered
  ${params.data.deaths} deaths`;
        },
        textStyle: {
          fontSize: 16
        }
      },
      itemStyle: {
        color: "darkred",
        opacity: 1
      },
      blendMode: "source-over",
      data
    }
  };
}

function injectToBaseOption(seriesNames, options) {
  return {
    baseOption: {
      backgroundColor: "#000",
      title: {
        text: "COVID-19 Globe View",
        textStyle: {
          color: "lightgrey"
        }
      },
      timeline: {
        right: 5,
        top: 60,
        bottom: 120,
        width: 55,
        loop: false,
        axisType: "category",
        data: seriesNames,
        currentIndex: seriesNames.length - 1,
        orient: "vertical",
        label: {
          position: -12,
          color: "white"
        },
        controlStyle: {
          itemSize: 24,
          color: "white",
          borderColor: "white"
        }
      },
      globe: {
        viewControl: {
          autoRotate: false
        },
        shading: "realistic",
        baseTexture: WorldTopology,
        heightTexture: WorldTopology,
        displacementScale: 0.03,
        light: {
          ambient: {
            intensity: 0.8
          },
          main: {
            intensity: 0.8
          }
        }
      }
    },
    options
  };
}

function dataScaleCalculation(point) {
  if (point > 0) return Math.max(Math.log2(point) * 3, 5);
  return 0;
}

window.addEventListener("load", async () => {
  aboutSection();
  const [seriesNames, seriesData] = await returnDataSeries();
  const options = seriesData.map(dataSet => produceOption(dataSet));
  var chart = echarts.init(document.getElementById("app"));
  chart.setOption(injectToBaseOption(seriesNames, options));

  window.onresize = function() {
    chart.resize();
  };
});
