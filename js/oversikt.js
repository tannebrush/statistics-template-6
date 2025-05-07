//Google Charts biblioteket
google.charts.load('current', { packages: ['corechart', 'bar'] });

//kör drawChart-funktionen
google.charts.setOnLoadCallback(drawChart);

async function drawChart() {


  let data = await dbQuery("SELECT * FROM Something");

  console.log(data);

  let maleSuicidal = 0;
  let femaleSuicidal = 0;
  let maleTotal = 0;
  let femaleTotal = 0;

  // Bearbeta varje rad i data
  data.forEach(row => {
    if (row.gender === 'Male') {
      maleTotal++;
      if (row.have_you_ever_had_suicidal_thoughts === 'Yes') {
        maleSuicidal++;
      }
    } else if (row.gender === 'Female') {
      femaleTotal++;  // Öka totalt antal kvinnor
      if (row.have_you_ever_had_suicidal_thoughts === 'Yes') {
        femaleSuicidal++;  // Öka antal kvinnor som haft självmordstankar
      }
    }
  });

  //datastruktur för Google Charts
  var chartData = google.visualization.arrayToDataTable([
    ['Gender', 'Had Suicidal Thoughts', 'Total'],
    ['Male', maleSuicidal, maleTotal],
    ['Female', femaleSuicidal, femaleTotal]
  ]);


  var options = {
    chart: {
      title: 'Självmordstankar mellan kön',
      subtitle: 'Jämförelse mellan män och kvinnor'
    },
    bars: 'vertical',
    hAxis: {
      title: 'Number of People',
    },
    vAxis: {
      title: 'Gender',
    }
  };

  //container för att hålla diagrammet
  var chartContainer = document.createElement('div');
  document.body.appendChild(chartContainer); // Lägg till container i body på sidan

  //rita diagrammet
  var chart = new google.charts.Bar(chartContainer);
  chart.draw(chartData, google.charts.Bar.convertOptions(options));
}
