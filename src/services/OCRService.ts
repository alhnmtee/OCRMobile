import MlkitOcr from 'react-native-mlkit-ocr';

class OCRService {
  /**
   * @param imageUri
   * @returns 
   */
  async performOCR(imageUri: string): Promise<string> {
    try {
      const recognizedTextBlocks = await MlkitOcr.detectFromUri(imageUri);
      return recognizedTextBlocks.map((block) => block.text).join('\n');
    } catch (error) {
      console.error('Error performing OCR:', error);
      throw new Error('OCR processing failed');
    }
  }
}

export default new OCRService();
