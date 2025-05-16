// pages/api/generate.js
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  const { age, difficulty, category, skills, learning_style, activities } = req.body;

  const filtered = activities.filter((act) => {
    return (
      act['Age Group']?.includes(age) &&
      act['Difficulty Level']?.toLowerCase().includes(difficulty.toLowerCase()) &&
      act['Category']?.toLowerCase().includes(category.toLowerCase()) &&
      act['Skills Developed']?.toLowerCase().includes(skills.toLowerCase()) &&
      act['Learning Style']?.toLowerCase().includes(learning_style.toLowerCase())
    );
  });

  if (filtered.length > 0) {
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    return res.status(200).json({ type: "static", result: random });
  }

  // Fallback to OpenAI
  const prompt = `Suggest a fun learning activity for a ${age}-year-old that is ${difficulty} difficulty, 
  related to ${category}, helps develop ${skills}, and works best for a ${learning_style} learner.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant who gives creative children's learning activities." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    });

    return res.status(200).json({ type: "ai", result: response.choices[0].message.content });
  } catch (err) {
    return res.status(500).json({ error: "OpenAI error", detail: err.message });
  }
}
