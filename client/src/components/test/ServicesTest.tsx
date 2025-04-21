import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranscriptionService } from '@/hooks/useTranscriptionService';
import { useTranslationService } from '@/hooks/useTranslationService';
import { useTextToSpeechService } from '@/hooks/useTextToSpeechService';
import { LANGUAGES, LANGUAGE_NAMES } from '@/types/speech-services';

export const ServicesTest = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('english');
  const [targetLanguage, setTargetLanguage] = useState('chinese');

  const { transcribe } = useTranscriptionService();
  const { translateText } = useTranslationService();
  const { textToSpeech } = useTextToSpeechService();

  const handleTranscribe = async () => {
    if (!file) return;
    try {
      const result = await transcribe.mutateAsync({ file, language: sourceLanguage });
      console.log('Transcription result:', result);
    } catch (error) {
      console.error('Transcription error:', error);
    }
  };

  const handleTranslate = async () => {
    if (!text) return;
    try {
      const result = await translateText.mutateAsync({
        text,
        sourceLanguage,
        targetLanguage,
      });
      console.log('Translation result:', result);
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  const handleTextToSpeech = async () => {
    if (!text) return;
    try {
      await textToSpeech.mutateAsync({
        text,
        language: targetLanguage,
      });
    } catch (error) {
      console.error('Text-to-Speech error:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Transcription Test</h2>
        <div className="space-y-2">
          <Label htmlFor="audio">Audio File</Label>
          <Input
            id="audio"
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <Button onClick={handleTranscribe} disabled={!file || transcribe.isPending}>
          {transcribe.isPending ? 'Transcribing...' : 'Transcribe'}
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Translation Test</h2>
        <div className="space-y-2">
          <Label htmlFor="text">Text</Label>
          <Input
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to translate"
          />
        </div>
        <Button onClick={handleTranslate} disabled={!text || translateText.isPending}>
          {translateText.isPending ? 'Translating...' : 'Translate'}
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Text-to-Speech Test</h2>
        <Button onClick={handleTextToSpeech} disabled={!text || textToSpeech.isPending}>
          {textToSpeech.isPending ? 'Converting...' : 'Convert to Speech'}
        </Button>
      </div>
    </div>
  );
}; 