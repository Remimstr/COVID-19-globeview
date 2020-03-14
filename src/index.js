/**
 * The entry point
 */

import echarts from "echarts";
import { scatter3D } from "echarts-gl";
import WorldTopology from "./world.topo.bathy.200401.jpg";

const covidStats =
  "https://api.github.com/repos/CSSEGISandData/COVID-19/contents/csse_covid_19_data/csse_covid_19_daily_reports/03-13-2020.csv";

function processCSVData(csv) {
  var allTextLines = csv.split(/\r\n|\n/);
  var lines = [];
  for (var i = 0; i < allTextLines.length; i++) {
    var data = allTextLines[i].split(",");
    var tarr = [];
    for (var j = 0; j < data.length; j++) {
      tarr.push(data[j]);
    }
    lines.push(tarr);
  }
  return lines;
}

function jsonToDataObjs(json) {
  return json.slice(1, -1).map(entry => {
    // longitude, latitude, count
    const province = entry[0];
    const country = entry[1];

    return {
      name: province ? `${province}, ${country}` : country,
      value: [parseFloat(entry[7]), parseFloat(entry[6])],
      confirmed: parseInt(entry[3]),
      deaths: parseInt(entry[4]),
      recovered: parseInt(entry[5])
    };
  });
}

function makeEchartsOptions(chart, series) {
  chart.setOption({
    backgroundColor: "#000",
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
    },
    series
  });
}

function dataScaleCalculation(point) {
  if (point > 0) return Math.max(Math.log2(point) * 3, 5);
  return 0;
}

window.addEventListener("load", () => {
  fetch(covidStats)
    .then(response => response.json())
    .then(data => processCSVData(atob(data.content)))
    .then(json => jsonToDataObjs(json))
    .then(data => {
      return {
        type: "scatter3D",
        coordinateSystem: "globe",
        symbolSize: (_, params) => dataScaleCalculation(params.data.confirmed),
        label: {
          position: "top",
          formatter: params => {
            const { confirmed, deaths, recovered } = params.data;
            return `${params.name}: ${confirmed + deaths + recovered} cases`;
          }
        },
        itemStyle: {
          color: "red",
          opacity: 0.9
        },
        blendMode: "overlap",
        data
      };
    })
    .then(series => {
      var chart = echarts.init(document.getElementById("app"));
      makeEchartsOptions(chart, series);
    });
});
