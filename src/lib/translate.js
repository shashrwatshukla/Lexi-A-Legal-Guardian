// Server-side translation (better quality)
export async function translateText(text, targetLanguage) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  
  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
        format: 'text'
      })
    }
  );

  const data = await response.json();
  return data.data.translations[0].translatedText;
}