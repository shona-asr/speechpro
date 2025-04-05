
import { db } from "../db";
import { 
  users, transcriptions, translations, 
  textToSpeeches, speechToSpeeches, 
  userStats, activities 
} from "@shared/schema";

async function seedDatabase() {
  // Create sample user
  const [user] = await db.insert(users).values({
    username: "demouser",
    email: "demo@example.com",
    displayName: "Demo User",
    password: null,
    firebaseId: "demo123"
  }).returning();

  // Create user stats
  await db.insert(userStats).values({
    userId: user.id,
    minutesTranscribed: 120,
    wordsTranslated: 5000,
    speechGenerated: 300,
    activeProjects: 3,
    usageCost: 1500
  });

  // Sample transcriptions
  const transcriptionData = [
    { fileName: "meeting1.mp3", originalLanguage: "en-US", content: "This is a sample transcription of a business meeting.", durationSeconds: 180 },
    { fileName: "interview.wav", originalLanguage: "es-ES", content: "Esta es una transcripción de muestra de una entrevista.", durationSeconds: 240 },
    { fileName: "lecture.mp3", originalLanguage: "fr-FR", content: "Ceci est un exemple de transcription d'une conférence.", durationSeconds: 300 },
    { fileName: "podcast.mp3", originalLanguage: "de-DE", content: "Dies ist eine Beispieltranskription eines Podcasts.", durationSeconds: 420 },
    { fileName: "speech.wav", originalLanguage: "it-IT", content: "Questa è una trascrizione di esempio di un discorso.", durationSeconds: 150 }
  ];

  for (const data of transcriptionData) {
    await db.insert(transcriptions).values({
      userId: user.id,
      ...data
    });
  }

  // Sample translations
  const translationData = [
    { sourceText: "Hello, how are you?", sourceLanguage: "en", targetLanguage: "es", translatedText: "Hola, ¿cómo estás?", wordCount: 4 },
    { sourceText: "The weather is nice today.", sourceLanguage: "en", targetLanguage: "fr", translatedText: "Le temps est beau aujourd'hui.", wordCount: 5 },
    { sourceText: "I love programming.", sourceLanguage: "en", targetLanguage: "de", translatedText: "Ich liebe Programmierung.", wordCount: 3 },
    { sourceText: "This is a sample text.", sourceLanguage: "en", targetLanguage: "it", translatedText: "Questo è un testo di esempio.", wordCount: 5 },
    { sourceText: "Nice to meet you.", sourceLanguage: "en", targetLanguage: "pt", translatedText: "Prazer em conhecê-lo.", wordCount: 4 }
  ];

  for (const data of translationData) {
    await db.insert(translations).values({
      userId: user.id,
      ...data
    });
  }

  // Sample text-to-speech entries
  const ttsData = [
    { text: "Welcome to our platform", language: "en-US", voice: "en-US-Neural2-A", audioUrl: "https://storage.example.com/tts1.mp3", wordCount: 4 },
    { text: "Bienvenido a nuestra plataforma", language: "es-ES", voice: "es-ES-Neural2-A", audioUrl: "https://storage.example.com/tts2.mp3", wordCount: 4 },
    { text: "Bienvenue sur notre plateforme", language: "fr-FR", voice: "fr-FR-Neural2-A", audioUrl: "https://storage.example.com/tts3.mp3", wordCount: 4 },
    { text: "Willkommen auf unserer Plattform", language: "de-DE", voice: "de-DE-Neural2-A", audioUrl: "https://storage.example.com/tts4.mp3", wordCount: 4 },
    { text: "Benvenuto sulla nostra piattaforma", language: "it-IT", voice: "it-IT-Neural2-A", audioUrl: "https://storage.example.com/tts5.mp3", wordCount: 4 }
  ];

  for (const data of ttsData) {
    await db.insert(textToSpeeches).values({
      userId: user.id,
      ...data
    });
  }

  // Sample speech-to-speech entries
  const stsData = [
    { fileName: "eng_speech.mp3", sourceLanguage: "en-US", targetLanguage: "es-ES", sourceText: "Hello world", translatedText: "Hola mundo", audioUrl: "https://storage.example.com/sts1.mp3", durationSeconds: 2 },
    { fileName: "spa_speech.mp3", sourceLanguage: "es-ES", targetLanguage: "fr-FR", sourceText: "Hola mundo", translatedText: "Bonjour le monde", audioUrl: "https://storage.example.com/sts2.mp3", durationSeconds: 2 },
    { fileName: "fra_speech.mp3", sourceLanguage: "fr-FR", targetLanguage: "de-DE", sourceText: "Bonjour le monde", translatedText: "Hallo Welt", audioUrl: "https://storage.example.com/sts3.mp3", durationSeconds: 2 },
    { fileName: "deu_speech.mp3", sourceLanguage: "de-DE", targetLanguage: "it-IT", sourceText: "Hallo Welt", translatedText: "Ciao mondo", audioUrl: "https://storage.example.com/sts4.mp3", durationSeconds: 2 },
    { fileName: "ita_speech.mp3", sourceLanguage: "it-IT", targetLanguage: "en-US", sourceText: "Ciao mondo", translatedText: "Hello world", audioUrl: "https://storage.example.com/sts5.mp3", durationSeconds: 2 }
  ];

  for (const data of stsData) {
    await db.insert(speechToSpeeches).values({
      userId: user.id,
      ...data
    });
  }

  // Sample activities
  const activityTypes = ["transcription", "translation", "textToSpeech", "speechToSpeech"];
  for (let i = 0; i < 5; i++) {
    await db.insert(activities).values({
      userId: user.id,
      activityType: activityTypes[i % activityTypes.length],
      activityId: i + 1,
      details: { completed: true, duration: 120 }
    });
  }

  console.log("Database seeded successfully!");
}

seedDatabase().catch(console.error);
