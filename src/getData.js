import papa from "papaparse";

const BASE_ENDPOINT =
  "https://api.github.com/repos/CSSEGISandData/COVID-19/contents/csse_covid_19_data/csse_covid_19_daily_reports/";

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

function getDates(startDate, stopDate) {
  function formatDate(date) {
    return `${("0" + (date.getMonth() + 1)).slice(-2)}-${(
      "0" + date.getDate()
    ).slice(-2)}-${date.getFullYear()}`;
  }
  var dateArray = new Array();
  var currentDate = startDate;
  while (currentDate < stopDate) {
    dateArray.push(formatDate(new Date(currentDate)));
    currentDate = currentDate.addDays(1);
  }
  return dateArray;
}

async function parseCsv(csv) {
  return new Promise(function(complete, error) {
    papa.parse(csv, { complete, error });
  });
}

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

export async function returnDataSeries() {
  const queryDates = getDates(
    new Date("March 1, 2020"),
    new Date().setDate(new Date().getDate() - 1)
  );
  const promiseList = queryDates.map(d =>
    fetch(`${BASE_ENDPOINT + d}.csv`)
  );
  const results = await Promise.allSettled(promiseList);
  var resultsArray = [];

  for await (const response of results) {
    // TODO: Add better error handling here
    if (response.status === "fulfilled" && response.value.status < 300) {
      const data = await response.value.json();
      const csvContent = await parseCsv(atob(data.content));
      csvContent.errors.forEach(error =>
        console.log(`CSV processing error: ${error}`)
      );
      resultsArray.push(jsonToDataObjs(csvContent.data.slice(0)));
    }
  }
  return [queryDates, resultsArray];
}
