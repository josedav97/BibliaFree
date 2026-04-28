import { useState, useRef, useCallback, useEffect } from 'react';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [voice, setVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      const spanishVoices = voices.filter((v) => v.lang.startsWith('es'));
      setAvailableVoices(spanishVoices.length ? spanishVoices : voices);
      if (!voice && spanishVoices.length) {
        setVoice(spanishVoices[0]);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text) => {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      if (voice) utterance.voice = voice;
      utterance.lang = 'es-ES';

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    },
    [rate, voice]
  );

  const pause = useCallback(() => {
    speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const setSpeakingRate = useCallback((newRate) => {
    setRate(newRate);
  }, []);

  const setSpeakingVoice = useCallback((newVoice) => {
    setVoice(newVoice);
  }, []);

  return {
    isSpeaking,
    isPaused,
    rate,
    voice,
    availableVoices,
    speak,
    pause,
    resume,
    stop,
    setSpeakingRate,
    setSpeakingVoice,
  };
}
