import { useState, useRef, useEffect } from 'react';
import { agentClient } from '../lib/http';
import { Mic, Square, Play, Pause, Volume2, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptReceived?: (transcript: string) => void;
  onAudioReceived?: (audioBlob: Blob) => void;
}

export default function VoiceRecorder({ onTranscriptReceived, onAudioReceived }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        setError('MediaRecorder is not supported in this browser. Please use a modern browser.');
        return;
      }

      // Request microphone permission with mobile-friendly constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Determine the best MIME type for the device
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeType = 'audio/wav';
        } else {
          // Fallback to default
          mimeType = '';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType || 'audio/webm' 
        });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed. Please try again.');
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (err: any) {
      console.error('Error starting recording:', err);
      
      // Provide specific error messages for different permission scenarios
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow microphone access in your browser settings and try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else if (err.name === 'NotSupportedError' || err.name === 'ConstraintNotSatisfiedError') {
        setError('Your device does not support the required audio format. Please try a different browser.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Microphone is already in use by another application. Please close other apps using the microphone.');
      } else {
        setError(`Failed to access microphone: ${err.message || 'Unknown error'}. Please check permissions and try again.`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    setIsUploading(true);
    setError(null);
    
    try {
      console.log('Uploading audio blob:', {
        size: audioBlob.size,
        type: audioBlob.type
      });
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      
      console.log('Sending request to:', `${agentClient.defaults.baseURL}/api/chat/voice/stt`);
      
      const response = await agentClient.post('/api/chat/voice/stt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout for audio upload
      });
      
      console.log('STT response:', response.data);
      
      const transcriptText = response.data;
      setTranscript(transcriptText);
      if (onTranscriptReceived) {
        onTranscriptReceived(transcriptText);
      }
      
    } catch (err: any) {
      console.error('Error uploading audio:', err);
      
      // Provide more specific error messages
      if (err.response) {
        // Server responded with error status
        console.error('Server error:', err.response.status, err.response.data);
        setError(`Server error: ${err.response.status} - ${err.response.data || 'Unknown error'}`);
      } else if (err.request) {
        // Request was made but no response received
        console.error('Network error:', err.request);
        setError('Network error: No response from server. Please check your connection.');
      } else {
        // Something else happened
        console.error('Request setup error:', err.message);
        setError(`Request failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const playTTS = async (text: string) => {
    try {
      console.log('Sending TTS request for text:', text);
      console.log('TTS request URL:', `${agentClient.defaults.baseURL}/api/chat/voice/tts`);
      
      const response = await agentClient.post('/api/chat/voice/tts', { text }, {
        responseType: 'blob',
        timeout: 30000, // 30 second timeout for TTS
      });
      
      console.log('TTS response received:', {
        size: response.data.size,
        type: response.data.type
      });
      
      const audioBlob = response.data;
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
      }
      
      if (onAudioReceived) {
        onAudioReceived(audioBlob);
      }
      
    } catch (err: any) {
      console.error('Error playing TTS:', err);
      
      if (err.response) {
        console.error('TTS server error:', err.response.status, err.response.data);
        setError(`TTS server error: ${err.response.status} - ${err.response.data || 'Unknown error'}`);
      } else if (err.request) {
        console.error('TTS network error:', err.request);
        setError('TTS network error: No response from server. Please check your connection.');
      } else {
        console.error('TTS request setup error:', err.message);
        setError(`TTS request failed: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state;
    } catch (err) {
      // Fallback for browsers that don't support permissions API
      return 'unknown';
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg md:text-xl font-semibold mb-4">Voice Chat</h2>
      
      {error && (
        <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start md:items-center">
          <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 md:mt-0 flex-shrink-0" />
          <span className="text-red-700 text-sm md:text-base">{error}</span>
        </div>
      )}

      <div className="space-y-4 md:space-y-6">
        {/* Mobile Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
          <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
            <strong>Mobile Users:</strong> Make sure to allow microphone access when prompted. 
            If permission is denied, go to your browser settings and enable microphone access for this site.
          </p>
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isUploading}
              className="btn-primary flex items-center w-full sm:w-auto justify-center px-6 py-3 md:py-4 text-sm md:text-base"
            >
              <Mic className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="btn-danger flex items-center w-full sm:w-auto justify-center px-6 py-3 md:py-4 text-sm md:text-base"
            >
              <Square className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Stop Recording ({formatTime(recordingTime)})
            </button>
          )}
        </div>

        {/* Upload Status */}
        {isUploading && (
          <div className="text-center text-gray-600 py-4 md:py-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              <span className="text-sm md:text-base">Transcribing audio...</span>
            </div>
          </div>
        )}

        {/* Transcript */}
        {transcript && (
          <div className="space-y-3 md:space-y-4">
            <h3 className="font-medium text-sm md:text-base">Transcript:</h3>
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <p className="text-gray-900 text-sm md:text-base leading-relaxed">{transcript}</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => playTTS(transcript)}
                className="btn-secondary flex items-center justify-center px-4 py-2 md:py-3 text-sm md:text-base"
              >
                <Volume2 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                TTS Response
              </button>
            </div>
          </div>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className="space-y-3 md:space-y-4">
            <h3 className="font-medium text-sm md:text-base">Audio Response:</h3>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={togglePlayback}
                className="btn-secondary flex items-center justify-center px-4 py-2 md:py-3 text-sm md:text-base w-full sm:w-auto"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                ) : (
                  <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                )}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
            <audio
              ref={audioRef}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              className="w-full"
              controls
            />
          </div>
        )}
      </div>
    </div>
  );
}
