import { Persona } from '../types';

class TextToSpeechService {
    private synth: SpeechSynthesis;
    private isAvailable: boolean;
    private voices: SpeechSynthesisVoice[] = [];
    private utteranceQueue: SpeechSynthesisUtterance[] = [];

    constructor() {
        this.isAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;
        if (this.isAvailable) {
            this.synth = window.speechSynthesis;
            // Voices are often loaded asynchronously. We need to listen for the event.
            this.synth.onvoiceschanged = () => {
                this.voices = this.synth.getVoices();
            };
            // Attempt an initial load.
            this.voices = this.synth.getVoices();
        } else {
            console.warn("Speech Synthesis not supported in this browser.");
            this.synth = {} as SpeechSynthesis; // dummy object
        }
    }

    get isSupported(): boolean {
        return this.isAvailable;
    }

    private isFemale(name: string): boolean {
        const lowerName = name.toLowerCase();
        // A simple list of known female names in the app's context
        const knownFemaleNames = ['ngozi', 'adaeze', 'bisi', 'chioma'];
        if (knownFemaleNames.some(fn => lowerName.includes(fn))) return true;

        // Heuristic for common Nigerian/Bantu language female name endings
        if (lowerName.endsWith('a') || lowerName.endsWith('i')) {
            // Avoid false positives for some male names
            const maleExceptions = ['buhari'];
            if (!maleExceptions.some(me => lowerName.includes(me))) {
                return true;
            }
        }
        return false;
    }

    private selectVoice(persona: Persona): SpeechSynthesisVoice | null {
        if (this.voices.length === 0) {
            // Try loading again in case they weren't ready initially.
            this.voices = this.synth.getVoices();
            if (this.voices.length === 0) return null;
        }

        const enVoices = this.voices.filter(v => v.lang.startsWith('en'));
        if (enVoices.length === 0) return null;

        // Score voices based on desired criteria
        const getScore = (voice: SpeechSynthesisVoice): number => {
            let score = 0;
            const vName = voice.name.toLowerCase();
            const vLang = voice.lang.toLowerCase();

            if (vLang.includes('ng') || vName.includes('nigeria')) score += 10;
            else if (vLang.includes('za') || vName.includes('africa')) score += 5;

            if (this.isFemale(persona.name) && (vName.includes('female') || vName.includes('woman'))) score += 2;
            if (!this.isFemale(persona.name) && (vName.includes('male') || vName.includes('man'))) score += 2;

            if (voice.localService) score += 1; // Prefer local voices for performance

            return score;
        };

        const scoredVoices = enVoices
            .map(voice => ({ voice, score: getScore(voice) }))
            .sort((a, b) => b.score - a.score);

        return scoredVoices.length > 0 ? scoredVoices[0].voice : enVoices[0];
    }

    private chunkText(text: string, maxLength: number): string[] {
        const chunks: string[] = [];
        let remainingText = text.trim();

        if (!remainingText) return [];
        
        while (remainingText.length > 0) {
            if (remainingText.length <= maxLength) {
                chunks.push(remainingText);
                break;
            }

            let sliceIndex = maxLength;
            
            const sentenceBreak = Math.max(
                remainingText.lastIndexOf('.', sliceIndex),
                remainingText.lastIndexOf('?', sliceIndex),
                remainingText.lastIndexOf('!', sliceIndex)
            );

            if (sentenceBreak > -1) {
                sliceIndex = sentenceBreak;
            } else {
                const wordBreak = remainingText.lastIndexOf(' ', sliceIndex);
                if (wordBreak > -1) {
                    sliceIndex = wordBreak;
                }
            }
            
            const chunk = remainingText.substring(0, sliceIndex + 1);
            chunks.push(chunk.trim());
            remainingText = remainingText.substring(sliceIndex + 1);
        }

        return chunks.filter(Boolean);
    }
    
    private processQueue(): void {
        if (this.utteranceQueue.length > 0 && !this.synth.speaking) {
            this.synth.speak(this.utteranceQueue.shift()!);
        }
    }

    speak(text: string, persona: Persona, onEnd?: () => void): void {
        if (!this.isAvailable || !text.trim()) {
            return;
        }
        
        this.cancel();

        const textChunks = this.chunkText(text, 180);
        const selectedVoice = this.selectVoice(persona);

        this.utteranceQueue = textChunks.map(chunk => {
            const utterance = new SpeechSynthesisUtterance(chunk);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            
            utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
                 console.error(
                    "SpeechSynthesisUtterance.onerror - Error:",
                    event.error,
                    "for chunk:",
                    `"${chunk}"`,
                    "Event details:",
                    event
                );
                this.utteranceQueue = []; // Stop processing queue on error.
                onEnd?.(); // Also call onEnd on error to reset UI
            };

            utterance.onend = () => {
                // If the queue is empty after this utterance, it means we are done with this speak request.
                if (this.utteranceQueue.length === 0) {
                   onEnd?.();
                }
                this.processQueue();
            };
            
            return utterance;
        });

        this.processQueue();
    }

    cancel(): void {
        if (!this.isAvailable) return;
        
        this.utteranceQueue = []; // Clear my internal queue first.
        if (this.synth.speaking || this.synth.pending) {
            this.synth.cancel(); // This may trigger onend/onerror, but our queue is empty.
        }
    }
}

export const ttsService = new TextToSpeechService();