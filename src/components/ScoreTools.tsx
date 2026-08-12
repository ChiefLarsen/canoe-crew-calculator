import { Delete, Gauge, Mic, Pause, Play, RotateCcw, SlidersHorizontal } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [peak, setPeak] = useState<number | null>(null);
  const [level, setLevel] = useState(0);
  const [recording, setRecording] = useState(false);

  const record = async () => {
    setRecording(true);
    setPeak(null);
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);
      let max = 0;
      const started = Date.now();
      await new Promise<void>((resolve) => {
        const tick = () => {
          analyser.getFloatTimeDomainData(buffer);
          let localMax = 0;
          for (const sample of buffer) localMax = Math.max(localMax, Math.abs(sample));
          max = Math.max(max, localMax);
          setLevel(Math.round(localMax * 100));
          if (Date.now() - started >= 3000) resolve();
          else requestAnimationFrame(tick);
        };
        tick();
      });
      setPeak(Math.round(max * 1000) / 10);
    } catch {
      toast.error("Kunne ikke få adgang til mikrofonen.");
    } finally {
      stream?.getTracks().forEach((t) => t.stop());
      void ctx?.close();
      setRecording(false);
      setLevel(0);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <p className="font-display text-5xl font-semibold tabular-nums">
        {peak !== null ? `${peak}%` : recording ? `${level}%` : "–"}
      </p>
      <p className="text-xs text-muted-foreground">
        Relativ lydmåling: lytter i 3 sekunder og gemmer den højeste top (0-100%).
      </p>
      <Button className="w-full" onClick={() => void record()} disabled={recording}>
        <Mic className="size-4" /> {recording ? "Optager…" : "Optag lyd"}
      </Button>
      <Button
        className="w-full"
        variant="secondary"
        disabled={peak === null}
        onClick={() => peak !== null && onSave(peak)}
      >
        Gem måling
      </Button>
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
  unit,
  currentValue,
  onSave,
}: {
  participantName: string;
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" aria-label={`Måleværktøjer for ${participantName}`}>
          <SlidersHorizontal className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{participantName}</DialogTitle>
          <DialogDescription>Måleværktøjer · enhed: {unit}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="timer">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timer">
              <Play className="size-3.5" /> Stopur
            </TabsTrigger>
            <TabsTrigger value="sound">
              <Gauge className="size-3.5" /> Lyd
            </TabsTrigger>
            <TabsTrigger value="pad">
              <SlidersHorizontal className="size-3.5" /> Tal
            </TabsTrigger>
          </TabsList>
          <TabsContent value="timer" className="pt-4">
            <Stopwatch onSave={save} />
          </TabsContent>
          <TabsContent value="sound" className="pt-4">
            <SoundMeter onSave={save} />
          </TabsContent>
          <TabsContent value="pad" className="pt-4">
            <Numpad onSave={save} initial={currentValue === undefined ? "" : String(currentValue)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
