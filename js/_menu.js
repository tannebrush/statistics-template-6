createMenu('Analys av psykisk ohälsa i Indien', [
  { name: 'Introduktion', script: 'Intro.js' },
  { name: 'Jämförelse', script: 'oversikt_jamforelse.js' },
  { name: 'CGPA', script: 'age_cgpa.js' },

  {
    name: 'Korrelation', sub: [
      { name: 'Akademisk tryck och depression', script: 'sleep_mental_health_correlation.js' },
      { name: 'Samband mellan finansiell stress och sömn', script: 'financial_sleep.js' }
    ]
  },
  {
    name: 'Psykisk ohälsa', sub: [
      { name: 'Faktorer för självmordstankar', script: 'mental_health_overview.js' },
    ]
  },

  { name: 'Sammanfattning', script: 'story.js' },
]);