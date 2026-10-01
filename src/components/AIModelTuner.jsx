import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, SectionLabel, Slider } from './ui';
import { PulseDot } from './icons';

export default function AIModelTuner({ modelState, onTrainingComplete, aiAgentOptimized, onToggleAIAgent }) {
  // Three model tabs: 'driver', 'maintenance', 'fuel'
  const [selectedModel, setSelectedModel] = useState('driver');
  const [learningRate, setLearningRate] = useState(0.01);
  const [epochs, setEpochs] = useState(25);
  
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [liveLossHistory, setLiveLossHistory] = useState([
    { epoch: 1, loss: 0.82, accuracy: 48 },
    { epoch: 5, loss: 0.54, accuracy: 68 },
    { epoch: 10, loss: 0.32, accuracy: 84 },
    { epoch: 15, loss: 0.21, accuracy: 91 },
    { epoch: 20, loss: 0.14, accuracy: 96 }
  ]);
  const [liveAccuracy, setLiveAccuracy] = useState(modelState[selectedModel]?.accuracy || 94.2);

  const modelTabs = [
    { id: 'driver', label: 'Driver Behavior' },
    { id: 'maintenance', label: 'Predictive Maintenance' },
    { id: 'fuel', label: 'Fuel Optimization' }
  ];

  const handleTrain = () => {
    setIsTraining(true);
    setCurrentEpoch(0);
    setLiveLossHistory([]);

    let ep = 0;
    const historyData = [];

    const interval = setInterval(() => {
      ep += 1;
      setCurrentEpoch(ep);

      const decayRate = 0.86;
      const loss = parseFloat((0.85 * Math.pow(decayRate, ep) + (Math.random() * 0.04)).toFixed(3));
      const acc = parseFloat(Math.min(99.6, 50 + (49 * (1 - Math.pow(0.85, ep))) + (Math.random() - 0.5) * 1.2).toFixed(1));

      historyData.push({ epoch: ep, loss, accuracy: acc });
      setLiveLossHistory([...historyData]);
      setLiveAccuracy(acc);

      if (ep >= epochs) {
        clearInterval(interval);
        setIsTraining(false);
        if (onTrainingComplete) {
          onTrainingComplete(selectedModel, {
            trained: true,
            accuracy: acc,
            history: historyData,
            lr: learningRate,
            epochs: epochs
          });
        }
      }
    }, 120);
  };

  // Accuracy Ring SVG metrics
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const accuracyOffset = circumference - (liveAccuracy / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-line shadow-sm p-5 relative overflow-hidden">
      <div className="racing-stripe" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0B3D91] animate-pulse" />
            <SectionLabel label="AUTONOMOUS AGENT / AI MODEL TUNER" />
          </div>
          <h3 className="text-lg font-bold text-text-hi font-heading mt-1">Neural Network Hyperparameter Lab</h3>
        </div>

        {/* Autonomous Agent Optimization Toggle */}
        <button
          onClick={onToggleAIAgent}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 border ${
            aiAgentOptimized
              ? 'bg-blue-50 text-[#0B3D91] border-blue-200 shadow-xs'
              : 'bg-slate-100 text-text-mid border-line hover:text-text-hi'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#0B3D91]" />
          {aiAgentOptimized ? 'AI REASONING ACTIVE' : 'MANUAL AI STATE'}
        </button>
      </div>

      {/* 3 Model Tabs in Brand Blue theme */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-line mb-4">
        {modelTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedModel(tab.id)}
            disabled={isTraining}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
              selectedModel === tab.id
                ? 'bg-white text-[#0B3D91] shadow-xs border border-slate-200'
                : 'text-text-mid hover:text-text-hi'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Controls & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
        
        {/* Sliders (Cols 1-7) */}
        <div className="md:col-span-7 flex flex-col gap-3 rounded-xl border border-line bg-slate-50 p-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-text-lo uppercase">Learning Rate (α)</span>
              <span className="text-[#0B3D91] font-bold tabular-nums">{learningRate}</span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.05"
              step="0.002"
              value={learningRate}
              disabled={isTraining}
              onChange={(e) => setLearningRate(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B3D91]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-text-lo uppercase">Training Epochs</span>
              <span className="text-[#0B3D91] font-bold tabular-nums">{epochs}</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={epochs}
              disabled={isTraining}
              onChange={(e) => setEpochs(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B3D91]"
            />
          </div>

          <button
            onClick={handleTrain}
            disabled={isTraining}
            className={`mt-2 py-2 px-4 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition flex items-center justify-center gap-2 ${
              isTraining
                ? 'bg-blue-100 text-[#0B3D91] cursor-not-allowed border border-blue-200'
                : 'bg-[#0B3D91] text-white hover:bg-[#093276] shadow-xs'
            }`}
          >
            {isTraining ? `Optimizing Epoch ${currentEpoch} / ${epochs}...` : 'Train Neural Model'}
          </button>
        </div>

        {/* Accuracy Ring Gauge (Cols 8-12) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center rounded-xl border border-line bg-slate-50 p-4">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="#E2E8F0"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="#0B3D91"
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={accuracyOffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold font-mono text-[#0B3D91] tabular-nums">
                {liveAccuracy.toFixed(1)}%
              </span>
              <span className="text-[9px] uppercase font-mono text-text-lo">Accuracy</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-text-lo mt-2">
            Loss: {liveLossHistory[liveLossHistory.length - 1]?.loss || 0.12}
          </span>
        </div>

      </div>

      {/* Live Loss Curve Chart */}
      <div className="rounded-xl border border-line bg-slate-50 p-3">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-[10px] uppercase text-text-lo font-semibold">Empirical Loss Convergence</span>
          <span className="text-[10px] text-[#0B3D91] font-mono font-bold">Cross-Entropy Loss</span>
        </div>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={liveLossHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0B3D91" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0B3D91" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="epoch" stroke="#475569" tick={{ fontSize: 10, fill: '#334155' }} />
              <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#334155' }} domain={[0, 1]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DDE2EA', borderRadius: '8px', fontSize: '10px', color: '#0F172A', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}
                formatter={(val) => [val, 'Loss']}
              />
              <Area type="monotone" dataKey="loss" stroke="#0B3D91" strokeWidth={2} fillOpacity={1} fill="url(#lossGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
