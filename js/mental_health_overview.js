google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawFactorsChart);

addMdToPage(`
## Förklaring av färgerna:

- **Rosa**: Representerar studenter som har hälsosamma kostvanor och livsstilar. Den rosa färgen symboliserar en mer positiv och hälsosam livsstil, som ofta är kopplad till individer som inte lider av negativa psykiska tillstånd eller självmordstankar.

- **Lila**: Den lila färgen används för att representera studenter som inte alls har problem eller självmordstankar. Detta är för individer som inte verkar påverkas av negativa psykiska faktorer som depression eller stress och som inte visar tecken på självmordstankar.

- **Blå**: Representerar en balanserad och ibland flexibel kosthållning. Studenter som har en medelväg när det gäller sina kostvanor – varken strikt hälsosamma eller ohälsosamma – men som ändå försöker hålla en rimlig nivå av kosthållning och livsstil.

- **Grön**: Denna färg används för att representera faktorer som kan vara kopplade till depression, stress eller familjerelaterade problem. Grön symboliserar en mer negativ aspekt där dessa faktorer kan påverka individer som kämpar med suicidaltankar, men kan också representera personer med en bättre förmåga att hantera dessa faktorer genom stöd eller egna copingstrategier.

- **Mörk Lila**: Används för att representera studenter som inte alls tar hand om sig själva, med brist på bra kost och hälsosamma vanor. Den mörka lila färgen kan också vara förknippad med individer som har ett ohälsosamt sätt att hantera sitt liv, vilket kan leda till psykiska eller fysiska problem, inklusive självmordstankar.

`);

async function drawFactorsChart() {
  try {

    let rawResult = await dbQuery(`
      SELECT 
        dietary_habits, 
        family_history_of_mental_illness
      FROM Something
      WHERE have_you_ever_had_suicidal_thoughts = 'Yes'
    `);


    console.log("Databasresultat:", rawResult);


    let data = Array.isArray(rawResult) ? rawResult : rawResult.rows || [];


    if (data.length === 0) {
      console.log("Ingen data som matchar kriterierna.");
      return;
    }


    console.log("Data att bearbeta:", data);


    const factorCounts = {};

    data.forEach(row => {
      ['dietary_habits', 'family_history_of_mental_illness'].forEach(factor => {
        let value = row[factor] || 'Okänt'; // Hantera tomma värden
        if (!factorCounts[value]) factorCounts[value] = 0;
        factorCounts[value]++;
      });
    });


    const chartData = [['Faktor', 'Antal']];
    for (let factor in factorCounts) {
      chartData.push([factor, factorCounts[factor]]);
    }


    console.log("Data för diagrammet:", chartData);


    let container = document.createElement('div');
    container.id = 'suicidalFactorsChart';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.height = '50vh'; // Justera höjd
    document.body.appendChild(container);


    drawGoogleChart({
      type: 'PieChart',
      data: chartData,
      options: {
        title: 'Vanligaste faktorer bland personer med suicidaltankar',
        is3D: true,
        height: 400,
        width: 600,
        legend: { position: 'right' },
        slices: {
          0: { color: '#f06292' },
          1: { color: '#ba68c8' },
          2: { color: '#7986cb' },
        }
      },
      elementId: 'suicidalFactorsChart'
    });

  } catch (error) {
    console.error("Fel vid hämtning eller visning av faktorer:", error);
  }
}


function drawGoogleChart({ type, data, options, elementId }) {
  const dataTable = google.visualization.arrayToDataTable(data);
  const chart = new google.visualization[type](document.getElementById(elementId));
  chart.draw(dataTable, options);
}
