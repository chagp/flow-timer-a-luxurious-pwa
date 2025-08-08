import React from 'react';
import { Settings, TimerMode, Interval } from '../types';

interface QuickPresetsProps {
  onApply: (settings: Settings, meta: { title: string; subtitle?: string }) => void;
}

function makeSimple(workSec: number, breakSec: number, sets: number, workLabel = 'WORK', breakLabel = 'REST', countdown = 0): Settings {
  return {
    mode: TimerMode.Simple,
    simple: { workTime: workSec, breakTime: breakSec, sets, workLabel, breakLabel },
    advanced: { rounds: 1, intervals: [] },
    countdown,
  };
}

function makeAdvancedBySequence(intervals: Interval[], countdown = 0): Settings {
  return {
    mode: TimerMode.Advanced,
    simple: { workTime: 60, breakTime: 60, sets: 1, workLabel: 'WORK', breakLabel: 'REST' },
    advanced: { rounds: 1, intervals },
    countdown,
  };
}

function makeAdvancedRepeat(intervalLabel: string, durationSec: number, rounds: number, countdown = 0): Settings {
  const base: Interval = { id: 'int-1', label: intervalLabel, duration: durationSec };
  return {
    mode: TimerMode.Advanced,
    simple: { workTime: 60, breakTime: 60, sets: 1, workLabel: 'WORK', breakLabel: 'REST' },
    advanced: { rounds, intervals: [base] },
    countdown,
  };
}

const QuickPresets: React.FC<QuickPresetsProps> = ({ onApply }) => {
  const handle = (settings: Settings, meta: { title: string; subtitle?: string }) => () => onApply(settings, meta);

  // Build sequences for some presets
  const seq = {
    tabataClassic: makeAdvancedBySequence([
      { id: 'wup', label: 'WARMUP', duration: 120 },
      // 8 rounds of 20/10
      ...Array.from({ length: 8 }, (_, i) => [
        { id: `w${i}-a`, label: 'WORK', duration: 20 },
        { id: `w${i}-r`, label: 'REST', duration: 10 },
      ]).flat() as Interval[],
      { id: 'cd', label: 'COOLDOWN', duration: 120 },
    ], 10),
    tabataDouble: makeAdvancedBySequence([
      { id: 'wup', label: 'WARMUP', duration: 120 },
      ...Array.from({ length: 8 }, (_, i) => [
        { id: `w${i}-a`, label: 'WORK', duration: 20 },
        { id: `w${i}-r`, label: 'REST', duration: 10 },
      ]).flat() as Interval[],
      { id: 'rs', label: 'REST SET', duration: 60 },
      ...Array.from({ length: 8 }, (_, i) => [
        { id: `w2${i}-a`, label: 'WORK', duration: 20 },
        { id: `w2${i}-r`, label: 'REST', duration: 10 },
      ]).flat() as Interval[],
      { id: 'cd', label: 'COOLDOWN', duration: 120 },
    ], 10),
    tabataAB: makeAdvancedBySequence([
      ...Array.from({ length: 4 }, (_, i) => [
        { id: `a${i}`, label: 'WORK A', duration: 20 },
        { id: `ar${i}`, label: 'REST', duration: 10 },
        { id: `b${i}`, label: 'WORK B', duration: 20 },
        { id: `br${i}`, label: 'REST', duration: 10 },
      ]).flat() as Interval[],
    ], 10),
    hiit3030x10: makeSimple(30, 30, 10, 'WORK', 'REST', 3),
    amrap12: makeAdvancedRepeat('AMRAP', 12 * 60, 1, 10),
    amrap20: makeAdvancedRepeat('AMRAP', 20 * 60, 1, 10),
    emom10: makeAdvancedRepeat('EMOM', 60, 10, 3),
    e2mom20: makeAdvancedRepeat('E2MOM', 2 * 60, 10, 3),
    cap15: makeAdvancedRepeat('FOR TIME (CAP)', 15 * 60, 1, 10),
    deathBy12: makeAdvancedRepeat('DEATH BY', 60, 12, 3),
    bjjPositional: makeAdvancedBySequence([
      ...Array.from({ length: 6 }, (_, i) => [
        { id: `w${i}`, label: 'WORK', duration: 6 * 60 },
        { id: `r${i}`, label: 'REST', duration: 60 },
      ]).flat() as Interval[],
    ], 3),
    bjjSparring: makeAdvancedBySequence([
      ...Array.from({ length: 5 }, (_, i) => [
        { id: `w${i}`, label: 'WORK', duration: 6 * 60 },
        { id: `r${i}`, label: 'REST', duration: 60 },
      ]).flat() as Interval[],
    ], 3),
    bjjOpenMat30: makeAdvancedRepeat('OPEN MAT', 30 * 60, 1, 3),
    bjjSharkTank: makeAdvancedBySequence([
      ...Array.from({ length: 10 }, (_, i) => [
        { id: `w${i}`, label: 'WORK', duration: 60 },
        { id: `r${i}`, label: 'TRANSITION', duration: 15 },
      ]).flat() as Interval[],
    ], 3),
    muayPads: makeAdvancedBySequence([
      ...Array.from({ length: 5 }, (_, i) => [
        { id: `w${i}`, label: 'ROUND', duration: 3 * 60 },
        { id: `r${i}`, label: 'REST', duration: 60 },
      ]).flat() as Interval[],
    ], 3),
    muayBag: makeAdvancedBySequence([
      ...Array.from({ length: 10 }, (_, i) => [
        { id: `w${i}`, label: 'ROUND', duration: 3 * 60 },
        { id: `r${i}`, label: 'REST', duration: 60 },
      ]).flat() as Interval[],
    ], 3),
    muayClinch: makeAdvancedBySequence([
      ...Array.from({ length: 6 }, (_, i) => [
        { id: `w${i}`, label: 'CLINCH', duration: 3 * 60 },
        { id: `r${i}`, label: 'REST', duration: 30 },
      ]).flat() as Interval[],
    ], 3),
    muaySprints8: makeSimple(30, 30, 8, 'SPRINT', 'REST', 3),
    muaySprints10: makeSimple(45, 15, 10, 'SPRINT', 'REST', 3),
    muayShadow: makeAdvancedBySequence([
      ...Array.from({ length: 5 }, (_, i) => [
        { id: `w${i}`, label: 'ROUND', duration: 3 * 60 },
        { id: `r${i}`, label: 'REST', duration: 60 },
      ]).flat() as Interval[],
    ], 3),
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {children}
      </div>
    </div>
  );

  const Btn: React.FC<{ label: string; onClick: () => void; subtitle?: string }> = ({ label, onClick, subtitle }) => (
    <button
      onClick={onClick}
      className="p-3 rounded-lg bg-light-subtle-bg dark:bg-dark-subtle-bg hover:bg-white/50 dark:hover:bg-black/20 text-left transition-colors"
    >
      <div className="font-semibold text-light-text dark:text-dark-text">{label}</div>
      {subtitle && <div className="text-xs text-light-text/70 dark:text-dark-text/70">{subtitle}</div>}
    </button>
  );

  return (
    <div className="space-y-4">
      <Section title="Tabata / HIIT">
        <Btn label="Tabata — Classic" subtitle="20/10 × 8, warmup+cooldown" onClick={handle(seq.tabataClassic, { title: 'Tabata — Classic', subtitle: '20/10 × 8, warmup+cooldown' })} />
        <Btn label="Tabata — Double" subtitle="20/10 × 8 × 2, 1:00 rest between" onClick={handle(seq.tabataDouble, { title: 'Tabata — Double', subtitle: '20/10 × 8 × 2, 1:00 rest between' })} />
        <Btn label="Tabata — A/B" subtitle="20/10 × 8 switching A/B" onClick={handle(seq.tabataAB, { title: 'Tabata — A/B', subtitle: '20/10 × 8 switching A/B' })} />
        <Btn label="HIIT 30/30 × 10" onClick={handle(seq.hiit3030x10, { title: 'HIIT 30/30 × 10' })} />
      </Section>
      <Section title="CrossFit Timers">
        <Btn label="AMRAP 12" onClick={handle(seq.amrap12, { title: 'AMRAP 12', subtitle: '12:00 continuous' })} />
        <Btn label="AMRAP 20" onClick={handle(seq.amrap20, { title: 'AMRAP 20', subtitle: '20:00 continuous' })} />
        <Btn label="EMOM 10" onClick={handle(seq.emom10, { title: 'EMOM 10', subtitle: 'Every minute × 10' })} />
        <Btn label="E2MOM 20" onClick={handle(seq.e2mom20, { title: 'E2MOM 20', subtitle: 'Every 2 minutes × 10' })} />
        <Btn label="For Time (Cap 15)" onClick={handle(seq.cap15, { title: 'For Time (Cap 15)' })} />
        <Btn label="Death By (12)" onClick={handle(seq.deathBy12, { title: 'Death By', subtitle: '12 minutes' })} />
      </Section>
      <Section title="BJJ">
        <Btn label="Positional Rounds" subtitle="6 × 6:00 / 1:00" onClick={handle(seq.bjjPositional, { title: 'BJJ Positional', subtitle: '6 × 6:00 / 1:00' })} />
        <Btn label="Sparring (Rolling)" subtitle="5 × 6:00 / 1:00" onClick={handle(seq.bjjSparring, { title: 'BJJ Sparring', subtitle: '5 × 6:00 / 1:00' })} />
        <Btn label="Open Mat Blocks (30:00)" onClick={handle(seq.bjjOpenMat30, { title: 'Open Mat Blocks', subtitle: '30:00 continuous' })} />
        <Btn label="Shark Tank (10 × 1:00 / 0:15)" onClick={handle(seq.bjjSharkTank, { title: 'Shark Tank', subtitle: '10 × 1:00 / 0:15' })} />
      </Section>
      <Section title="Muay Thai">
        <Btn label="Pads (5 × 3:00 / 1:00)" onClick={handle(seq.muayPads, { title: 'Muay Thai Pads', subtitle: '5 × 3:00 / 1:00' })} />
        <Btn label="Bag Rounds (10 × 3:00 / 1:00)" onClick={handle(seq.muayBag, { title: 'Muay Thai Bag', subtitle: '10 × 3:00 / 1:00' })} />
        <Btn label="Clinch (6 × 3:00 / 0:30)" onClick={handle(seq.muayClinch, { title: 'Muay Thai Clinch', subtitle: '6 × 3:00 / 0:30' })} />
        <Btn label="Conditioning Sprints (8 × 0:30 / 0:30)" onClick={handle(seq.muaySprints8, { title: 'Sprints', subtitle: '8 × 0:30 / 0:30' })} />
        <Btn label="Conditioning Sprints (10 × 0:45 / 0:15)" onClick={handle(seq.muaySprints10, { title: 'Sprints', subtitle: '10 × 0:45 / 0:15' })} />
        <Btn label="Shadowboxing (5 × 3:00 / 1:00)" onClick={handle(seq.muayShadow, { title: 'Shadowboxing', subtitle: '5 × 3:00 / 1:00' })} />
      </Section>
    </div>
  );
};

export default QuickPresets;


