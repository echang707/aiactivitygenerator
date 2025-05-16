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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Find a Fun Learning Activity</h1>

        <div className="space-y-4">
          <div>
            <label className="block font-medium">Child's Age:</label>
            <input type="text" name="age" onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block font-medium">Difficulty Level:</label>
            <input type="text" name="difficulty" onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block font-medium">Category:</label>
            <input type="text" name="category" onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block font-medium">Skills Developed:</label>
            <input type="text" name="skills" onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block font-medium">Learning Style:</label>
            <input type="text" name="learning_style" onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700"
          >
            Generate Activity
          </button>
        </div>

        {result && result.type === 'static' && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">{result.result['Activity Name']}</h2>
            <p className="mb-2"><strong>Description:</strong> {result.result['Description']}</p>
            <p className="mb-2"><strong>Materials Needed:</strong> {result.result['Materials Needed']}</p>
            {result.result['Links to Activities'] && (
              <a
                href={result.result['Links to Activities']}
                className="text-blue-500 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Activity
              </a>
            )}
          </div>
        )}

        {result && result.type === 'ai' && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">AI-Generated Activity</h2>
            <p>{result.result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
