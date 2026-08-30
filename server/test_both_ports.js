async function testBothPorts() {
  console.log("--- Testing Port 5173 (Vite Dev Server) ---");
  try {
    const res1 = await fetch('http://localhost:5173');
    console.log("Port 5173 Status:", res1.status, res1.statusText);
  } catch (e) {
    console.error("Port 5173 Error:", e.message);
  }

  console.log("--- Testing Port 5000 (Express Full-Stack Server) ---");
  try {
    const res2 = await fetch('http://localhost:5000');
    console.log("Port 5000 Status:", res2.status, res2.statusText);
    const html = await res2.text();
    console.log("Port 5000 HTML length:", html.length);
  } catch (e) {
    console.error("Port 5000 Error:", e.message);
  }
}
testBothPorts();
