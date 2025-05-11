const chartDiv = document.createElement('div');
chartDiv.id = 'cgpaChart';
document.body.appendChild(chartDiv);

google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawCGPAChart);

addMdToPage(`
### Analys av CGPA per Åldersgrupp:

#### Åldersgruppen 19-22:
- **Genomsnittlig CGPA:** 7.627  
Denna åldersgrupp har det lägsta genomsnittet i denna uppsättning, vilket kan tyda på att yngre individer kanske fortfarande anpassar sig till den akademiska miljön eller att deras studier fortfarande är i ett tidigt skede.

#### Åldersgruppen 23-26:
- **Genomsnittlig CGPA:** 7.727  
Denna grupp har det högsta genomsnittliga CGPA-värdet, vilket kan tyda på att personer i denna åldersgrupp har fått mer erfarenhet och har anpassat sig bättre till den akademiska världen. Det kan också vara en åldersgrupp som är mer motiverad att upprätthålla goda betyg, kanske i samband med yrkesförberedelse eller specialisering.

#### Åldersgruppen 27-30:
- **Genomsnittlig CGPA:** 7.658  
Denna åldersgrupp visar ett något lägre genomsnitt än 23-26, men fortfarande en stabil och hög CGPA. Det kan tyda på att även om denna åldersgrupp har mer livserfarenhet, kan faktorer som familj eller arbetsansvar påverka deras akademiska prestationer.

#### Åldersgruppen 31-34:
- **Genomsnittlig CGPA:** 7.636  
Åldersgruppen 31-34 har ett genomsnitt som är mycket nära 27-30, vilket tyder på att de fortsätter att prestera på en jämn nivå. Detta kan indikera att akademisk framgång inte påverkas mycket av ålder så länge personen är motiverad och fokuserad.

### Sammanfattning:
Den mest framstående observationen är att åldersgruppen 23-26 har den högsta genomsnittliga CGPA, vilket kan vara en åldersgrupp som har det största akademiska fokuset. 19-22-gruppen visar en något lägre prestation, medan 27-30 och 31-34 grupperna tenderar att hålla sig på ett stabilt nivå, vilket antyder att erfarenhet inte nödvändigtvis leder till högre CGPA, men det kan leda till mer jämn prestation. Det är också möjligt att externa faktorer såsom arbetsliv och familj påverkar prestanda för de äldre grupperna.
`);

async function drawCGPAChart() {
  try {

    removeOldChart();

    const ageGroups = [
      { label: '19-22', minAge: 19, maxAge: 22 },
      { label: '23-26', minAge: 23, maxAge: 26 },
      { label: '27-30', minAge: 27, maxAge: 30 },
      { label: '31-34', minAge: 31, maxAge: 34 },
    ];

    let chartData = [['Åldersgrupp', 'Genomsnittlig CGPA']];

    // Loop genom åldersgrupper för att hämta genomsnittlig CGPA för varje grupp
    for (const group of ageGroups) {
      const query = `
        SELECT AVG(cgpa) AS avg_cgpa
        FROM Something
        WHERE age BETWEEN ${group.minAge} AND ${group.maxAge}
      `;
      const result = await dbQuery(query);

      if (result.length > 0) {
        chartData.push([group.label, parseFloat(result[0].avg_cgpa)]);
      } else {
        chartData.push([group.label, 0]);
      }
    }


    drawGoogleChart({
      type: 'ColumnChart',
      data: chartData,
      options: {
        title: 'Genomsnittlig CGPA per åldersgrupp',
        height: 500,
        width: 900,
        chartArea: { left: "15%", top: "10%" },
        hAxis: { title: 'Åldersgrupp' },
        vAxis: { title: 'Genomsnittlig CGPA' },
        legend: { position: 'none' },
        bar: { groupWidth: '80%' },
        colors: ['#8E24AA'],
      }
    });
  } catch (error) {
    console.error("Fel vid hämtning eller visning av CGPA data:", error);
  }
}


function removeOldChart() {
  const oldChart = document.getElementById('cgpaChart');
  if (oldChart) {
    oldChart.remove(); // Ta bort det gamla diagrammet från DOM
  }


  const newChartDiv = document.createElement('div');
  newChartDiv.id = 'cgpaChart';


  newChartDiv.style.display = 'flex';
  newChartDiv.style.justifyContent = 'center';
  newChartDiv.style.alignItems = 'center';
  newChartDiv.style.marginTop = '20px';

  document.body.appendChild(newChartDiv);
}


function drawGoogleChart({ type, data, options }) {
  const dataTable = google.visualization.arrayToDataTable(data);
  const chart = new google.visualization[type](document.getElementById('cgpaChart'));
  chart.draw(dataTable, options);
}

