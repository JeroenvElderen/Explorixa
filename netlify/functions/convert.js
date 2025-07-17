const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const { from, to, amount } = event.queryStringParameters || {};

  if (!from || !to || !amount) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required query parameters: from, to, amount" }),
    };
  }

  try {
    const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data || data.success === false) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to fetch conversion rate" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};
