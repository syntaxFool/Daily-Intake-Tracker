export default async (req, res) => {
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbyAdCA_O1UHdCU3l-yukuXZNDXE98pNzl0vQXoBQp85p8sYlpNSmnJziQx6xMn9k4/exec';

  // Forward method, headers, and body
  const fetchOptions = {
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (req.method !== 'GET') {
    fetchOptions.body = JSON.stringify(req.body);
  }

  // Forward the request to GAS
  const response = await fetch(GAS_URL, fetchOptions);
  const data = await response.text();

  // Set CORS headers for Netlify
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Return the GAS response
  res.status(response.status).send(data);
};
