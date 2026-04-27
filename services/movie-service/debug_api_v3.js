(async () => {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/showtimes/admin/41');
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body Snippet:", text.slice(0, 500));
  } catch (err) {
    console.log("Error:", err.message);
  }
})();
