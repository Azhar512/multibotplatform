// VoiceControls.js
import React from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceControls = ({ isRecording, onStartRecording, onStopRecording }) => {
  return (
    <button
      className={`voice-control-button ${isRecording ? 'recording' : ''}`}
      onClick={isRecording ? onStopRecording : onStartRecording}
      title={isRecording ? 'Stop Recording' : 'Start Recording'}
    >
      {isRecording ? <MicOff className="mic-icon" /> : <Mic className="mic-icon" />}
    </button>
  );
};

export default VoiceControls;