// pages/index.js
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function Home() {
  const [csvData, setCsvData] = useState([]);
  const [form, setForm] = useState({
    age: '',
    difficulty: '',
    category: '',
    skills: '',
    learning_style: '',
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vTtFuozEPrIMGRyH5EIs0XjdvY1S3IUNXAEFtPyRT0nj7WfoXeMtsyGVnFdfKYNP8AOKnnebArCyigC/pub?output=csv", {
      download: true,
      header: true,
      complete: (res) => setCsvData(res.data),
    });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, activities: csvData }),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>🧠 AI Activity Generator</h1>

      <input name="age" placeholder="Age" onChange={handleChange} />
      <input name="difficulty" placeholder="Difficulty" onChange={handleChange} />
      <input name="category" placeholder="Category" onChange={handleChange} />
      <input name="skills" placeholder="Skills Developed" onChange={handleChange} />
      <input name="learning_style" placeholder="Learning Style" onChange={handleChange} />
      <button onClick={handleSubmit}>Generate Activity</button>

      {result && result.type === "static" && (
        <div style={{ marginTop: '2rem' }}>
          <h2>{result.result["Activity Name"]}</h2>
          <p><strong>Materials:</strong> {result.result["Materials Needed"]}</p>
          <p><a href={result.result["Links to Activities"]} target="_blank">Go to Activity</a></p>
        </div>
      )}

      {result && result.type === "ai" && (
        <div style={{ marginTop: '2rem' }}>
          <h2>AI-Generated Activity</h2>
          <p>{result.result}</p>
        </div>
      )}
    </main>
  );
}
