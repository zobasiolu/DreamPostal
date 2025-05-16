import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate a caption from audio data
export async function generateCaptionFromAudio(audioBase64: string): Promise<string> {
  try {
    // 1. First analyze the audio using OpenAI Vision API
    const audioAnalysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing audio and describing ambient sleep sounds poetically. Create imaginative, dreamy descriptions."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this short audio clip of ambient sleep sounds. Create a poetic, surreal description of the soundscape."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:audio/wav;base64,${audioBase64}`
              }
            }
          ],
        },
      ],
      max_tokens: 150,
    });

    const audioAnalysis = audioAnalysisResponse.choices[0].message.content || '';

    // 2. Generate a dreamy caption based on the analysis
    const captionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You create poetic, surreal dream-like captions for postcards. The captions should be short (under 100 characters), evocative, and mysterious."
        },
        {
          role: "user",
          content: `Based on this audio analysis: "${audioAnalysis}", create a short, dreamy, surreal postcard caption that captures the essence of the sounds in a poetic way. Make it mysterious and evocative.`
        }
      ],
      max_tokens: 100,
    });

    return captionResponse.choices[0].message.content || 'Whispers of dreamscapes, echoing through the corridors of sleep';
  } catch (error) {
    console.error("Error generating caption:", error);
    return "Whispers of dreamscapes, echoing through the corridors of sleep";
  }
}

// Generate an image based on a caption
export async function generateImageFromCaption(caption: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a dreamlike, surreal postcard image that visualizes this poetic caption: "${caption}". The image should be dreamy, with pastel gradients and ethereal qualities, suitable for a sleep-themed postcard. Make it beautiful and mysterious.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data[0].url || '';
  } catch (error) {
    console.error("Error generating image:", error);
    // Return a placeholder dreamy landscape if image generation fails
    return "https://images.unsplash.com/photo-1499678329028-101435549a4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
  }
}
