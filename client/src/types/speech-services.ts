export const LANGUAGES = {
  'auto': 'autodetect',
  'english': 'en',
  'chinese': 'zh',
  'shona': 'sn',
  'ndebele': 'nr'
} as const;

export const TTS_VOICE_MAP = {
  english: 'en-US',
  chinese: 'cmn-CN',
  shona: 'af-ZA',
  ndebele: 'af-ZA',
} as const;

export const LANGUAGE_NAMES = {
  auto: 'Auto Detect',
  english: 'English',
  chinese: 'Chinese',
  shona: 'Shona',
  ndebele: 'Ndebele'
} as const;

export type Language = keyof typeof LANGUAGES;
export type LanguageCode = typeof LANGUAGES[Language]; 