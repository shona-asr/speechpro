import { Link } from "wouter";
import { Mic, Languages, Volume2, Link2, PlayCircle, Sparkles, ChevronRight, Github, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Mic className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">SpeechGenius</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/about">
              <a className="text-gray-600 hover:text-gray-900">About</a>
            </Link>
            <Link href="/login">
              <Button variant="default">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-6 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Advanced AI for Speech Processing
              </h1>
              <p className="text-xl text-gray-700 max-w-lg">
                Transform speech to text, translate content, and convert text back to speech 
                with our powerful AI-driven platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/login">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="gap-2">
                    Learn More <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 relative z-10">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Mic className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">Speech Recognition</span>
                  </div>
                  <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Active
                  </div>
                </div>
                <div className="py-4">
                  <p className="text-gray-700 mb-2 text-sm">Transcribed audio:</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-800">
                      "The advanced AI model transforms speech into accurate text, supporting multiple languages and accents."
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Check className="h-3 w-3" /> Accurate
                  </Button>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary/15 rounded-full blur-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Speech Processing Capabilities</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform offers comprehensive tools for handling all your speech-related needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Transcription</h3>
              <p className="text-gray-600 mb-4">
                Convert speech to text with high accuracy using cutting-edge AI models. Support for multiple languages and formats.
              </p>
              <Link href="/transcribe">
                <a className="text-primary font-medium inline-flex items-center">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Languages className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Translation</h3>
              <p className="text-gray-600 mb-4">
                Translate content between languages with contextual understanding and natural phrasing.
              </p>
              <Link href="/translate">
                <a className="text-primary font-medium inline-flex items-center">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Volume2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Text to Speech</h3>
              <p className="text-gray-600 mb-4">
                Generate natural-sounding speech from text in various voices, languages, and styles.
              </p>
              <Link href="/text-to-speech">
                <a className="text-primary font-medium inline-flex items-center">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <PlayCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Mode</h3>
              <p className="text-gray-600 mb-4">
                Process speech in real-time for live transcription, subtitles, and interactive applications.
              </p>
              <Link href="/realtime-mode">
                <a className="text-primary font-medium inline-flex items-center">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Link2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Speech to Speech</h3>
              <p className="text-gray-600 mb-4">
                Translate spoken content directly to another language while preserving voice characteristics.
              </p>
              <Link href="/speech-to-speech">
                <a className="text-primary font-medium inline-flex items-center">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Advanced AI Models</h3>
              <p className="text-gray-600 mb-4">
                Powered by state-of-the-art AI models including Whisper Large Shona for unparalleled accuracy.
              </p>
              <Link href="/about">
                <a className="text-primary font-medium inline-flex items-center">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Speech Processing?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get started today and experience the power of our AI-driven speech tools.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="px-8">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Mic className="h-6 w-6 text-white" />
                <span className="text-xl font-bold text-white">SpeechGenius</span>
              </div>
              <p className="mb-4">
                Advanced AI speech processing for everyone. Transform your audio content with ease.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Features</h3>
              <ul className="space-y-2">
                <li><Link href="/transcribe"><a className="hover:text-white">Transcription</a></Link></li>
                <li><Link href="/translate"><a className="hover:text-white">Translation</a></Link></li>
                <li><Link href="/text-to-speech"><a className="hover:text-white">Text to Speech</a></Link></li>
                <li><Link href="/realtime-mode"><a className="hover:text-white">Real-time Mode</a></Link></li>
                <li><Link href="/speech-to-speech"><a className="hover:text-white">Speech to Speech</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/about"><a className="hover:text-white">About</a></Link></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>© {new Date().getFullYear()} SpeechGenius. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;