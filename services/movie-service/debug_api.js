const axios = require('axios');

(async () => {
  try {
    const res = await axios.get('http://127.0.0.1:3000/api/showtimes/admin/41');
    console.log("Response:", res.data);
  } catch (err) {
    console.log("Error status:", err.response?.status);
    console.log("Error body:", err.response?.data);
  }
})();
