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

  const [dropdowns, setDropdowns] = useState({
    difficulty: [],
    category: [],
    skills: [],
    learning_style: [],
  });

  useEffect(() => {
    Papa.parse(
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vTtFuozEPrIMGRyH5EIs0XjdvY1S3IUNXAEFtPyRT0nj7WfoXeMtsyGVnFdfKYNP8AOKnnebArCyigC/pub?output=csv',
      {
        download: true,
        header: true,
        complete: (res) => {
          const data = res.data;
          setCsvData(data);

          const uniqueCleanValues = (key) => {
            const items = new Set();
            data.forEach((row) => {
              const raw = row[key];
              if (!raw) return;
              raw.split(',').forEach((item) => {
                const trimmed = item.trim();
                if (trimmed) items.add(trimmed);
              });
            });
            return Array.from(items).sort();
          };

          setDropdowns({
            difficulty: uniqueCleanValues('Difficulty Level'),
            category: uniqueCleanValues('Category'),
            skills: uniqueCleanValues('Skills Developed'),
            learning_style: uniqueCleanValues('Learning Style'),
          });
        },
      }
    );
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#F5F0E4' }}
    >
    <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-10 space-y-6 border border-gray-100">  
        <h1 className="text-3xl font-semibold text-center">Find a Fun Learning Activity</h1>
  
        {/* FORM */}
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Child&apos;s Age:</label>
            <input
              type="text"
              name="age"
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
  
          {['difficulty', 'category', 'skills', 'learning_style'].map((field) => (
            <div key={field}>
              <label className="block font-medium mb-1 capitalize">{field.replace('_', ' ')}:</label>
              <select
                name={field}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                defaultValue=""
              >
                <option value="" disabled>Select an option</option>
                {dropdowns[field].map((val, i) => (
                  <option key={i} value={val}>{val}</option>
                ))}
              </select>
            </div>
          ))}
  
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700"
          >
            Generate Activity
          </button>
        </div>
  
        {/* STATIC MATCH RESULT */}
        {result && result.type === 'static' && (
          <div className="pt-6 border-t">
            <h2 className="text-2xl font-bold mb-4">Suggested Activity</h2>
  
            <h3 className="text-xl font-semibold mb-2">{result.result['Activity Name']}</h3>
  
            {result.result['Description'] && (
              <p className="mb-4 text-gray-700">{result.result['Description']}</p>
            )}
  
            {result.result['Materials Needed'] && (
              <div className="mb-4">
                <p className="font-medium mb-1">Materials Needed:</p>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {result.result['Materials Needed'].split(',').map((item, i) => (
                    <li key={i}>{item.trim()}</li>
                  ))}
                </ul>
              </div>
            )}
  
            {result.result['Links to Activities'] && (
              <p className="text-sm">
                <span className="font-medium">Link:</span>{' '}
                <a
                  href={result.result['Links to Activities']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Click here
                </a>
              </p>
            )}
          </div>
        )}
  
        {/* AI RESULT — CLEANLY FORMATTED */}
        {result && result.type === 'ai' && (
          <div className="pt-6 border-t space-y-6">
            <h2 className="text-2xl font-bold">AI-Generated Activity</h2>
  
            {result.result
              .split(/\n(?=\d+\.|Activity|Materials|Instructions|Learning outcomes)/)
              .filter(Boolean)
              .map((section, i) => {
                const titleMatch = section.match(/^(Activity|Materials|Instructions|Learning outcomes)/i);
                const isTitle = !!titleMatch;
  
                return (
                  <div key={i} className="text-gray-800 text-sm whitespace-pre-line">
                    {isTitle ? (
                      <>
                        <h3 className="text-lg font-semibold mt-4 mb-1">
                          {titleMatch[0] === "Materials" ? "Materials Needed" : titleMatch[0]}
                        </h3>
                        <p>
                          {section
                            .replace(titleMatch[0], '')
                            .replace(/^[:\-–\s]+/, '')
                            .replace(/^Needed[:\-–\s]*/i, '') // 🔥 This line fixes the orphaned "Needed:"
                            .trim()}
                        </p>
                      </>
                    ) : (
                      <p>{section.trim()}</p>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
  
}
