
const chartDiv = document.createElement('div');
chartDiv.id = 'familyHistoryChart';
document.body.appendChild(chartDiv);

addMdToPage(`## Samband mellan familjehistoria av psykisk ohälsa och depression'
  
Det finns ett svagt positivt samband mellan att ha en familjehistoria av psykisk ohälsa och upplevd depression.

Personer med familjehistoria rapporterar i genomsnitt högre nivåer av depression.`);


google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawFamilyHistoryChart);

async function drawFamilyHistoryChart() {
  try {
    let data = await dbQuery(`
      SELECT family_history_of_mental_illness, AVG(depression) AS avg_depression
      FROM Something
      WHERE depression IS NOT NULL AND family_history_of_mental_illness IS NOT NULL
      GROUP BY family_history_of_mental_illness
    `);

    console.log("Fetched data:", data);

    if (!data || data.length === 0) {
      chartDiv.innerText = "Ingen data tillgänglig.";
      return;
    }


    const chartData = [['Familjehistoria', 'Genomsnittlig depression']];
    data.forEach(row => {
      let label = row.family_history_of_mental_illness === 'Yes' ? 'Ja' : 'Nej';
      chartData.push([label, parseFloat(row.avg_depression)]);
    });

    drawGoogleChart({
      type: 'LineChart',
      data: chartData,
      options: {
        title: 'Samband mellan familjehistoria och depression',
        height: 500,
        width: 900,
        chartArea: { left: "15%", top: "10%" },
        hAxis: { title: 'Familjehistoria av psykisk ohälsa' },
        vAxis: { title: 'Genomsnittlig depression' },
        legend: { position: 'none' },
        pointSize: 7,
        lineWidth: 3,
        colors: ['#1E88E5'],
      }
    });

  } catch (error) {
    console.error("Fel vid hämtning eller bearbetning av data:", error);
    chartDiv.innerText = "Ett fel uppstod vid hämtning av data.";
  }
}

function drawGoogleChart({ type, data, options }) {
  const dataTable = google.visualization.arrayToDataTable(data);
  const chart = new google.visualization[type](document.getElementById('familyHistoryChart'));
  chart.draw(dataTable, options);
}
