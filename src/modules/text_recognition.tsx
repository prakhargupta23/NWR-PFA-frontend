import React, { useState, useRef } from 'react';

const AudioRecorder: React.FC = () => {
  const [recording, setRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Error accessing microphone', error);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    console.log("voice response start",mediaRecorderRef)
    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      setRecording(false);
        console.log("audioblob",audioBlob)
      // Send the audio to API
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      console.log("voice response",formData)
      try {
        const response = await fetch("http://127.0.0.1:5000/upload", {
          method: "POST",
          body: formData,
        });
        
        console.log('Upload success:', response);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    };
  };

  return (
    <div>
      <button onClick={startRecording} disabled={recording}>Start </button>
      <button onClick={stopRecording} disabled={!recording}>Stop </button>
    </div>
  );
};

export default AudioRecorder;
