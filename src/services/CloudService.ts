import axios from 'axios';

const HUGGINGFACE_API_KEY = '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';
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/gpt2';  

export class CloudService {
  static async getExplanationFromOCR(ocrText: string): Promise<string> {
    try {
      const response = await axios.post(
        HUGGINGFACE_API_URL,
        {
          inputs: `Give a short and simple explanation :${ocrText}`,  
        },
        {
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data[0] && response.data[0].generated_text) {
        return response.data[0].generated_text.trim();
      } else {
        throw new Error('No explanation generated.');
      }
    } catch (error) {
      console.error('Error fetching explanation from Hugging Face:', error);
      throw new Error('Failed to fetch explanation');
    }
  }
}
