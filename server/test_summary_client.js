const axios = require('axios');

async function run() {
  try {
    const payload = {
      data: [
        { Month: 'Jan', Sales: 100 },
        { Month: 'Feb', Sales: 150 },
        { Month: 'Mar', Sales: 130 }
      ],
      chartConfig: { chartType: 'line', xAxis: 'Month', yAxis: 'Sales', title: 'Sales Over Time' }
    };

    const res = await axios.post('http://localhost:5000/api/debug/summarize', payload, { timeout: 5000 });
    console.log('Status:', res.status);
    console.log('Body:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Server responded with status', err.response.status, err.response.data);
    } else {
      console.error('Request error:', err.message);
    }
  }
}

run();
