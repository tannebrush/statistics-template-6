addMdToPage(`
## Jämförelse mellan Män och Kvinnor – Självmordstankar

### Män
- **63,2%** av männen rapporterade att de haft självmordstankar.
- **36,8%** av männen rapporterade att de inte haft självmordstankar.

### Kvinnor
- **63,3%** av kvinnorna rapporterade att de haft självmordstankar.
- **36,7%** av kvinnorna rapporterade att de inte haft självmordstankar.

### Slutsats
- **Liten skillnad i frekvensen av självmordstankar:** Det är intressant att notera att andelen män och kvinnor med självmordstankar är nästan identisk, med män som har en andel på 63,2% och kvinnor på 63,3%. Denna lilla skillnad kan tyda på att självmordstankar påverkar båda kön i samma omfattning.
  
- **Liknande risker:** Både män och kvinnor verkar ha en betydande andel som rapporterar självmordstankar, vilket understryker vikten av att adressera mental hälsa och självmordsförebyggande åtgärder för alla individer oavsett kön.
  
- **Behovet av skräddarsydda insatser:** Trots den lilla skillnaden i procent kan det finnas andra faktorer som påverkar dessa resultat, som exempelvis sociala, ekonomiska eller psykologiska aspekter som skiljer sig åt mellan könen. Därför kan det vara nödvändigt att utveckla köns-specifika strategier för att hantera och förebygga självmordstankar.

Det är tydligt att självmordstankar inte är begränsade till något särskilt kön, utan påverkar både män och kvinnor på liknande sätt. Därför måste stödåtgärder och resurser vara tillgängliga för alla som kämpar med dessa tankar, oavsett kön.
`);

google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

async function drawChart() {
  try {
    removeOldChart();

    let data = await dbQuery(`
      SELECT gender, have_you_ever_had_suicidal_thoughts
      FROM Something
    `);

    let maleSuicidal = 0, maleTotal = 0;
    let femaleSuicidal = 0, femaleTotal = 0;

    data.forEach(row => {
      if (row.gender === 'Male') {
        maleTotal++;
        if (row.have_you_ever_had_suicidal_thoughts === 'Yes') maleSuicidal++;
      } else if (row.gender === 'Female') {
        femaleTotal++;
        if (row.have_you_ever_had_suicidal_thoughts === 'Yes') femaleSuicidal++;
      }
    });

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '40px';
    document.body.appendChild(container);

    const maleDiv = document.createElement('div');
    maleDiv.id = 'maleChart';
    container.appendChild(maleDiv);

    const femaleDiv = document.createElement('div');
    femaleDiv.id = 'femaleChart';
    container.appendChild(femaleDiv);

    const maleData = google.visualization.arrayToDataTable([
      ['Status', 'Antal'],
      ['Hade självmordstankar', maleSuicidal],
      ['Hade inte självmordstankar', maleTotal - maleSuicidal]
    ]);

    const femaleData = google.visualization.arrayToDataTable([
      ['Status', 'Antal'],
      ['Hade självmordstankar', femaleSuicidal],
      ['Hade inte självmordstankar', femaleTotal - femaleSuicidal]
    ]);

    drawGoogleChart({
      type: 'PieChart',
      data: maleData,
      options: {
        title: 'Mäns självmordstankar',
        pieSliceText: 'percentage',
        slices: {
          0: { color: '#1E88E5' },
          1: { color: '#BBDEFB' }
        },
        width: 400,
        height: 300,
        is3D: true
      },
      elementId: 'maleChart'
    });

    drawGoogleChart({
      type: 'PieChart',
      data: femaleData,
      options: {
        title: 'Kvinnors självmordstankar',
        pieSliceText: 'percentage',
        slices: {
          0: { color: '#F06292' },
          1: { color: '#F8BBD0' }
        },
        width: 400,
        height: 300,
        is3D: true
      },
      elementId: 'femaleChart'
    });

  } catch (error) {
    console.error("Fel vid hämtning eller bearbetning av data:", error);
  }
}

function removeOldChart() {
  const oldCharts = document.querySelectorAll('#maleChart, #femaleChart');
  oldCharts.forEach(chart => chart.remove());
}

function drawGoogleChart({ type, data, options, elementId }) {
  const chart = new google.visualization[type](document.getElementById(elementId));
  chart.draw(data, options);
}
