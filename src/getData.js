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
  var dateArray = [];
  var currentDate = startDate;
  while (currentDate < stopDate) {
    dateArray.push(formatDate(new Date(currentDate)));
    currentDate = currentDate.addDays(1);
  }
  return dateArray;
}

function jsonToDataObjs(json) {
  return json.slice(1, -1).map(entry => {
    // longitude, latitude, count
    const province = entry["Province/State"];
    const country = entry["Country/Region"];
    const longitude = parseFloat(entry["Longitude"]);
    const latitude = parseFloat(entry["Latitude"]);

    const confirmed = parseInt(entry["Confirmed"]);
    const deaths = parseInt(entry["Deaths"]);
    const recovered = parseInt(entry["Recovered"]);

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
    new Date("March 22, 2020")
  );
  
  console.log("This is queryDates", queryDates);
  let results = queryDates.map((date) => (
    require(`../data/${date}.json`)
  ));
  
  let resultsArray = [];

  for (const result of results) {
    // TODO: Add better error handling here
    resultsArray.push(jsonToDataObjs(result.slice(0)));
  }
  
  return [queryDates, resultsArray];
}
