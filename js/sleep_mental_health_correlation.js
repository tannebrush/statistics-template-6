
if (!document.getElementById('chartSelector')) {

  addMdToPage(`
  ### Normalfördelning för CGPA: 
 **Medelvärde** (7.66) och Standardavvikelse (1.47):
  CGPA:n för studenterna ligger i genomsnitt på 7.66, med en standardavvikelse på 1.47, vilket innebär att de flesta studenter har ett CGPA mellan 6.19 och 9.13.

  **Histogrammet:**
  visar en symmetrisk fördelning, där de flesta studenter har CGPA nära medelvärdet (7.66). Det finns flest studenter med CGPA mellan 7.50 och 8.00.

  **Normalfördelningskurva:**
  Den röda linjen följer en normalfördelning, vilket tyder på att CGPA:n är fördelad enligt en typisk normalfördelning med fler studenter nära medelvärdet.

  **Tendens och vidare tolkning:**
  Majoriteten av studenterna har relativt höga betyg, och den normala fördelningen indikerar att de flesta har liknande akademiska prestationer, vilket kan tyda på ett högpresterande studentgrupp.
`);





  const dropdown = document.createElement('select');
  dropdown.id = 'chartSelector';
  dropdown.innerHTML = `
    <option value="">-- Välj ett diagram --</option>
    <option value="cgpaChart">Normalfördelning CGPA</option>
    <option value="correlationChart">Akademiskt Tryck vs Depression</option>
  `;
  document.body.appendChild(dropdown);
}

['correlationChart', 'cgpaChart'].forEach(id => {
  if (!document.getElementById(id)) {
    const div = document.createElement('div');
    div.id = id;
    div.style.display = 'none';
    document.body.appendChild(div);
  }
});


document.getElementById('chartSelector').addEventListener('change', (e) => {
  const selected = e.target.value;
  ['correlationChart', 'cgpaChart'].forEach(id => {
    document.getElementById(id).style.display = id === selected ? 'block' : 'none';
  });

  if (selected === 'correlationChart') drawCorrelationChart();
  if (selected === 'cgpaChart') drawCgpaChart();
});


google.charts.load('current', { packages: ['corechart'] });


async function drawCorrelationChart() {
  try {
    const data = await dbQuery(`
      SELECT academic_pressure, depression
      FROM Something
      WHERE academic_pressure IS NOT NULL AND depression IS NOT NULL
    `);

    const grouped = {};
    data.forEach(row => {
      const level = row.academic_pressure;
      const isDepressed = parseInt(row.depression) === 1;

      if (!grouped[level]) {
        grouped[level] = { total: 0, depressed: 0 };
      }

      grouped[level].total += 1;
      if (isDepressed) grouped[level].depressed += 1;
    });

    const chartData = [['Akademiskt Tryck', 'Andel med Depression (%)']];
    const academicPressures = [];
    const depressionRates = [];

    Object.keys(grouped).sort((a, b) => a - b).forEach(level => {
      const { total, depressed } = grouped[level];
      const percentage = total > 0 ? (depressed / total) * 100 : 0;
      chartData.push([`Tryck ${level}`, percentage]);

      academicPressures.push(parseFloat(level));
      depressionRates.push(percentage);
    });

    const correlation = calculateCorrelation(academicPressures, depressionRates);
    console.log("Korrelationskoefficient:", correlation.toFixed(2));

    drawGoogleChart({
      type: 'ColumnChart',
      data: chartData,
      options: {
        title: 'Andel med depression per nivå av akademiskt tryck',
        height: 500,
        width: 900,
        chartArea: { left: "15%", top: "10%" },
        hAxis: { title: 'Akademiskt Tryck' },
        vAxis: {
          title: 'Depression (%)',
          minValue: 0,
          maxValue: 100
        },
        legend: { position: 'none' },
        colors: ['#1E88E5'],
      }
    }, 'correlationChart');

  } catch (error) {
    console.error("Fel vid hämtning eller bearbetning av data:", error);
    document.getElementById('correlationChart').innerText = "Ett fel uppstod vid hämtning av data.";
  }
}

//normalfördelning av CGPA med kurva
async function drawCgpaChart() {
  try {
    const data = await dbQuery(`
      SELECT cgpa
      FROM Something
      WHERE cgpa IS NOT NULL
    `);

    const values = data.map(row => parseFloat(row.cgpa)).filter(v => !isNaN(v));
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length);

    const bins = 20;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / bins;
    const histogram = Array(bins).fill(0);

    values.forEach(value => {
      const bin = Math.min(bins - 1, Math.floor((value - min) / binSize));
      histogram[bin]++;
    });

    // Normalfördelningsdata 
    const normalCurve = [];
    const scale = Math.max(...histogram);
    for (let i = 0; i < bins; i++) {
      const x = min + i * binSize + binSize / 2;
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
        Math.exp(-Math.pow(x - avg, 2) / (2 * Math.pow(stdDev, 2)));
      normalCurve.push(y);
    }

    const maxY = Math.max(...normalCurve);
    const scaledNormal = normalCurve.map(y => y / maxY * scale);

    const chartData = [['CGPA', 'Histogram', 'Normalfördelning']];
    for (let i = 0; i < bins; i++) {
      const label = `${(min + i * binSize).toFixed(2)}–${(min + (i + 1) * binSize).toFixed(2)}`;
      chartData.push([
        label,
        histogram[i],
        scaledNormal[i]
      ]);
    }

    drawGoogleChart({
      type: 'ComboChart',
      data: chartData,
      options: {
        title: `CGPA Normalfördelning (Medel: ${avg.toFixed(2)}, StdAvv: ${stdDev.toFixed(2)})`,
        height: 500,
        width: 900,
        chartArea: { left: "15%", top: "10%" },
        hAxis: { title: 'CGPA Intervall' },
        vAxis: { title: 'Antal Studenter' },
        seriesType: 'bars',
        series: {
          1: { type: 'line', color: '#E53935' }
        },
        legend: { position: 'top' },
        colors: ['#43A047']
      }
    }, 'cgpaChart');

  } catch (error) {
    console.error("Fel vid hämtning av CGPA-data:", error);
    document.getElementById('cgpaChart').innerText = "Kunde inte ladda CGPA-data.";
  }
}

//korrelation
function calculateCorrelation(x, y) {
  const n = x.length;
  const avgX = x.reduce((a, b) => a + b, 0) / n;
  const avgY = y.reduce((a, b) => a + b, 0) / n;

  const numerator = x.reduce((sum, xi, i) => sum + ((xi - avgX) * (y[i] - avgY)), 0);
  const denominator = Math.sqrt(
    x.reduce((sum, xi) => sum + Math.pow(xi - avgX, 2), 0) *
    y.reduce((sum, yi) => sum + Math.pow(yi - avgY, 2), 0)
  );

  return denominator === 0 ? 0 : numerator / denominator;
}


function drawGoogleChart({ type, data, options }, elementId) {
  const dataTable = google.visualization.arrayToDataTable(data);
  const chart = new google.visualization[type](document.getElementById(elementId));
  chart.draw(dataTable, options);
}
