async function checkClient() {
  try {
    const res = await fetch('http://localhost:5173');
    console.log("Vite Server Status:", res.status, res.statusText);
    const html = await res.text();
    console.log("HTML length:", html.length);
    console.log("HTML snippet:", html.slice(0, 300));
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}
checkClient();
