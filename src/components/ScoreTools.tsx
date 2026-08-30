import { Delete, Mic, Pause, Play, RotateCcw, SlidersHorizontal, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CompetitionCategory } from "@/lib/types";

function Stopwatch({ onSave }: { onSave: (value: number) => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startedAt = useRef(0);
  const base = useRef(0);

  useEffect(() => {
    if (!running) return;
    startedAt.current = Date.now();
    const id = window.setInterval(() => {
      setElapsed(base.current + (Date.now() - startedAt.current) / 1000);
    }, 50);
    return () => window.clearInterval(id);
  }, [running]);

  const stop = () => {
    base.current = elapsed;
    setRunning(false);
  };

  return (
    <div className="space-y-4 text-center">
      <p className="font-display text-5xl font-semibold tabular-nums">{elapsed.toFixed(2)}s</p>
      <div className="flex justify-center gap-2">
        {running ? (
          <Button variant="secondary" onClick={stop}>
            <Pause className="size-4" /> Pause
          </Button>
        ) : (
          <Button onClick={() => setRunning(true)}>
            <Play className="size-4" /> Start
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => {
            setRunning(false);
            base.current = 0;
            setElapsed(0);
          }}
        >
          <RotateCcw className="size-4" /> Nulstil
        </Button>
      </div>
      <Button
        className="w-full"
        disabled={elapsed === 0}
        onClick={() => {
          stop();
          onSave(Number(elapsed.toFixed(2)));
        }}
      >
        Gem tid
      </Button>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface SoundMeterProps {
  onSaveScore: (score: number) => void;
}

export const SoundMeter: React.FC<SoundMeterProps> = ({ onSaveScore }) => {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [currentDb, setCurrentDb] = useState(0);
  const [accumulatedScore, setAccumulatedScore] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const NOISE_THRESHOLD = 60; // dB baggrundsstøj-tærskel (kun lyde over 60 dB tæller)
  const TEST_DURATION = 5;    // Målingen kører i 5 sekunder

  const startMeasurement = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsMeasuring(true);
      setTimeLeft(TEST_DURATION);
      setAccumulatedScore(0);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let runningScore = 0;
      let durationLeft = TEST_DURATION;

      // Mål lydstyrke hvert 100 millisekund
      const sampleInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        const db = Math.min(120, Math.round((average / 255) * 120));
        setCurrentDb(db);

        // Hvis lyden er over tærsklen på 60 dB, lægges overskuddet til scoren
        if (db > NOISE_THRESHOLD) {
          runningScore += (db - NOISE_THRESHOLD);
          setAccumulatedScore(runningScore);
        }
      }, 100);

      // Sekund-timer til nedtælling
      intervalRef.current = setInterval(() => {
        durationLeft -= 1;
        setTimeLeft(durationLeft);

        if (durationLeft <= 0) {
          clearInterval(sampleInterval);
          stopMeasurement(runningScore);
        }
      }, 1000);

    } catch (err) {
      console.error("Fejl ved adgang til mikrofon:", err);
    }
  };

  const stopMeasurement = (finalScore: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }

    setIsMeasuring(false);
    onSaveScore(finalScore);
  };

  return (
    <div className="p-4 border rounded-xl bg-card space-y-4 text-center">
      <h3 className="font-bold text-lg">📢 Lydenergi-måler (Lydstyrke + Varighed)</h3>
      <p className="text-sm text-muted-foreground">
        Måler samlet hyl i 5 sekunder. Kun lyd over {NOISE_THRESHOLD} dB tæller med.
      </p>

      {isMeasuring ? (
        <div className="space-y-3">
          <div className="text-3xl font-extrabold text-primary">
            Tid tilbage: {timeLeft}s
          </div>
          <div className="text-lg">
            Lyd Lige Nu: <span className="font-bold">{currentDb} dB</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            Akkumuleret Score: {accumulatedScore} pts
          </div>
          <Progress value={((TEST_DURATION - timeLeft) / TEST_DURATION) * 100} />
        </div>
      ) : (
        <Button onClick={startMeasurement} size="lg" className="w-full">
          Start 5-sekunders brøl-test 🚀
        </Button>
      )}
    </div>
  );
};

function Numpad({ onSave, initial }: { onSave: (value: number) => void; initial: string }) {
  const [text, setText] = useState(initial);
  const press = (key: string) => {
    setText((prev) => {
      if (key === "." && prev.includes(".")) return prev;
      return prev + key;
    });
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-muted/40 p-4 text-right font-display text-3xl tabular-nums">
        {text || "0"}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((key) => (
          <Button key={key} variant="outline" className="h-12 text-lg" onClick={() => press(key)}>
            {key}
          </Button>
        ))}
        <Button
          variant="outline"
          className="h-12"
          aria-label="Slet sidste ciffer"
          onClick={() => setText((prev) => prev.slice(0, -1))}
        >
          <Delete className="size-4" />
        </Button>
      </div>
      <Button
        className="w-full"
        disabled={text === "" || Number.isNaN(Number(text))}
        onClick={() => onSave(Number(text))}
      >
        Gem værdi
      </Button>
    </div>
  );
}

export function ScoreTools({
  participantName,
  category,
  unit,
  currentValue,
  onSave,
}: {
  participantName: string;
  category: CompetitionCategory;
  unit: string;
  currentValue: number | undefined;
  onSave: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const save = (value: number) => {
    onSave(value);
    setOpen(false);
    toast.success(`${value} gemt til ${participantName}`);
  };
  const tool = category === "tid" ? "timer" : category === "lyd" ? "sound" : "pad";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" aria-label={`Måleværktøjer for ${participantName}`}>
          {tool === "timer" ? (
            <Timer className="size-4" />
          ) : tool === "sound" ? (
            <Mic className="size-4" />
          ) : (
            <SlidersHorizontal className="size-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{participantName}</DialogTitle>
          <DialogDescription>
            {tool === "timer" ? "Stopur" : tool === "sound" ? "Lydmåler" : "Indtastning"} · enhed:{" "}
            {unit}
          </DialogDescription>
        </DialogHeader>
        {tool === "timer" ? <Stopwatch onSave={save} /> : null}
        {tool === "sound" ? <SoundMeter onSave={save} /> : null}
        {tool === "pad" ? (
          <Numpad onSave={save} initial={currentValue === undefined ? "" : String(currentValue)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
