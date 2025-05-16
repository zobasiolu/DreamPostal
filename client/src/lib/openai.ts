import { apiRequest } from "./queryClient";

export async function recordAudio(userId: number, audioData: string): Promise<any> {
  try {
    const response = await apiRequest("POST", "/api/record", {
      userId,
      audioData
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error recording audio:", error);
    throw error;
  }
}

export async function likePostcard(postcardId: number): Promise<any> {
  try {
    const response = await apiRequest("POST", `/api/postcards/${postcardId}/like`, {});
    return await response.json();
  } catch (error) {
    console.error("Error liking postcard:", error);
    throw error;
  }
}

export async function createTrade(fromId: number, toId: number, postcardId: number): Promise<any> {
  try {
    const response = await apiRequest("POST", "/api/trades", {
      fromId,
      toId,
      postcardId
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error creating trade:", error);
    throw error;
  }
}
