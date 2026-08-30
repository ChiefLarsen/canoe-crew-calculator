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

function SoundMeter({ onSave }: { onSave: (value: number) => void }) {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [progress, setProgress] = useState(0);

  const toDb = (rms: number) => {
    if (rms <= 0) return 0;
    const db = 120 + 20 * Math.log10(rms);
    return Math.max(0, Math.min(120, Math.round(db * 10) / 10));
  };

  const stopRecording = (finalScore: number) => {
    setRecording(false);
    setProgress(100);
    setTimeLeft(0);
    onSave(Number(finalScore.toFixed(1)));
  };

  const record = async () => {
    setRecording(true);
    setScore(0);
    setLevel(0);
    setTimeLeft(5);
    setProgress(0);

    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let intervalId: number | undefined;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });

      ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);
      const started = performance.now();
      const noiseThreshold = 60;

      const tick = () => {
        analyser.getFloatTimeDomainData(buffer);
        let sum = 0;
        for (const sample of buffer) sum += sample * sample;
        const rms = Math.sqrt(sum / buffer.length);
        const currentDb = toDb(rms);
        const elapsedMs = performance.now() - started;
        const elapsedSeconds = elapsedMs / 1000;
        const remaining = Math.max(0, 5 - elapsedSeconds);

        setLevel(currentDb);
        setTimeLeft(Number(remaining.toFixed(1)));
        setProgress(Math.min(100, (elapsedSeconds / 5) * 100));

        if (currentDb > noiseThreshold) {
          setScore((prev) => {
            const next = prev + (currentDb - noiseThreshold);
            return Number(next.toFixed(1));
          });
        }

        if (elapsedSeconds >= 5) {
          stopRecording(Number(score + Math.max(0, currentDb - noiseThreshold)));
          return;
        }
      };

      intervalId = window.setInterval(tick, 100);
      await new Promise<void>((resolve) => {
        const wait = () => {
          if (!recording) {
            resolve();
            return;
          }
          const elapsed = performance.now() - started;
          if (elapsed >= 5000) {
            resolve();
            return;
          }
          requestAnimationFrame(wait);
        };
        wait();
      });
    } catch {
      toast.error("Kunne ikke få adgang til mikrofonen.");
    } finally {
      window.clearInterval(intervalId);
      stream?.getTracks().forEach((t) => t.stop());
      void ctx?.close();
      setRecording(false);
      setLevel(0);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <p className="font-display text-5xl font-semibold tabular-nums">
        {recording ? `${score.toFixed(1)}` : "–"}
      </p>
      <div className="space-y-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Aktuel lyd</span>
          <span>{level} dB</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Forløb</span>
          <span>{timeLeft.toFixed(1)}s</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Akkumuleret lydenergi: hvert sample over 60 dB lægges til score, så længere og højere støj giver højere værdi.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button className="w-full" onClick={() => void record()} disabled={recording}>
          <Mic className="size-4" /> {recording ? "Optager…" : "Start test"}
        </Button>
        <Button
          className="w-full"
          variant="secondary"
          disabled={!recording}
          onClick={() => {
            if (recording) {
              setRecording(false);
              window.clearInterval(intervalId);
              onSave(Number(score.toFixed(1)));
            }
          }}
        >
          <Pause className="size-4" /> Stop
        </Button>
      </div>
    </div>
  );
}

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
