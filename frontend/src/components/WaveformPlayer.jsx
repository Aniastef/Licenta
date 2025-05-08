import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Box, Button } from "@chakra-ui/react";

const WaveformPlayer = ({ url }) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#ccc",
      progressColor: "#f43f5e",
      height: 80,
      barWidth: 2,
      responsive: true,
    });

    wavesurferRef.current.load(url);

    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [url]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(wavesurferRef.current.isPlaying());
    }
  };

  return (
    <Box>
      <Box ref={waveformRef} w="100%" mb={2} />
      <Button size="sm" onClick={togglePlay} colorScheme="yellow" mt={2}>
        {isPlaying ? "||" : "▶"}
      </Button>
    </Box>
  );
};

export default WaveformPlayer;
