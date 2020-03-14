/**
 * The entry point
 */

import echarts from "echarts";
import { scatter3D } from "echarts-gl";
import WorldTopology from "./world.topo.bathy.200401.jpg";
import { aboutSection } from "./aboutSection.js";
import "./style.css";

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
    const longitude = parseFloat(entry[7]);
    const latitude = parseFloat(entry[6]);

    const confirmed = parseInt(entry[3]);
    const deaths = parseInt(entry[4]);
    const recovered = parseInt(entry[5]);

    const sum = confirmed + deaths + recovered;

    return {
      name: province ? `${province}, ${country}` : country,
      value: [longitude, latitude, 0, sum],
      confirmed,
      deaths,
      recovered
    };
  });
}

function makeEchartsOptions(series) {
  return {
    backgroundColor: "#000",
    title: {
      text: "COVID-19 Globe View",
      textStyle: {
        color: "lightgrey"
      }
    },
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
  };
}

function dataScaleCalculation(point) {
  if (point > 0) return Math.max(Math.log2(point) * 3, 5);
  return 0;
}

window.addEventListener("load", () => {
  aboutSection();
  fetch(covidStats)
    .then(response => response.json())
    .then(data => processCSVData(atob(data.content)))
    .then(json => jsonToDataObjs(json))
    .then(data => {
      return {
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
      };
    })
    .then(series => {
      var chart = echarts.init(document.getElementById("app"));
      chart.setOption(makeEchartsOptions(series));
      window.onresize = function() {
        chart.resize();
      };
    });
});
