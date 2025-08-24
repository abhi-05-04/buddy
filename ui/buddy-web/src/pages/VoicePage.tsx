import VoiceRecorder from '../components/VoiceRecorder';
import SSEConsole from '../components/SSEConsole';
import { useState } from 'react';

export default function VoicePage() {
  const [transcript, setTranscript] = useState('');

  const handleTranscriptReceived = (newTranscript: string) => {
    setTranscript(newTranscript);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <VoiceRecorder onTranscriptReceived={handleTranscriptReceived} />
      
      {transcript && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Continue Chat with Transcript</h3>
          <SSEConsole onTranscriptUpdate={() => setTranscript('')} />
        </div>
      )}
    </div>
  );
}
