import React, { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AIModelTuner({ modelState, onTrainingComplete, aiAgentOptimized, onToggleAIAgent }) {
  const [selectedModel, setSelectedModel] = useState('driver');
  const [learningRate, setLearningRate] = useState(0.01);
  const [epochs, setEpochs] = useState(20);
  const [modelType, setModelType] = useState('Neural Network');
  
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [liveHistory, setLiveHistory] = useState([]);

  const handleTrain = () => {
    setIsTraining(true);
    setCurrentEpoch(0);
    setLiveHistory([]);

    let epoch = 0;
    const historyData = [];

    const isLRExploded = learningRate > 0.12;
    const isUnderfitted = epochs < 10;

    const interval = setInterval(() => {
      epoch += 1;
      setCurrentEpoch(epoch);

      let loss = 0;
      let accuracy = 0;

      if (isLRExploded) {
        // High learning rate causes loss to oscillate or explode
        loss = 0.5 + Math.random() * 0.45;
        accuracy = 30 + Math.random() * 15;
      } else {
        // Learning rate is optimal
        const convergenceRate = modelType === 'Random Forest' ? 0.75 : 0.84;
        loss = 0.8 * Math.pow(convergenceRate, epoch) + Math.random() * 0.05;
        accuracy = Math.min(99.4, 45 + (54.4 * (1 - Math.pow(0.8, epoch))) + (Math.random() - 0.5) * 1.5);
      }

      // If epochs are too low, accuracy is cut short
      if (isUnderfitted && epoch === epochs) {
        accuracy = Math.min(accuracy, 78);
      }

      historyData.push({
        name: `${epoch}`,
        loss: parseFloat(loss.toFixed(3)),
        accuracy: parseFloat(accuracy.toFixed(1))
      });

      setLiveHistory([...historyData]);

      if (epoch >= epochs) {
        clearInterval(interval);
        setIsTraining(false);
        onTrainingComplete(selectedModel, {
          trained: true,
          accuracy: accuracy,
          isErratic: isLRExploded,
          history: historyData,
          lr: learningRate,
          epochs: epochs,
          type: modelType
        });
      }
    }, 150); // Speed up training for user-friendly execution
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Cloud AI Hub</p>
        <h2 className="text-xl font-semibold text-white">AI Model Training & Tuning</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left Tuning Panel */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1" htmlFor="model-select">
              Select AI Target Model
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isTraining}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-cyan-400 disabled:opacity-50"
            >
              <option value="driver">Driving Behavior Classifier</option>
              <option value="maintenance">Maintenance Breakdown Predictor</option>
              <option value="fuel">Fuel Efficiency Optimizer</option>
            </select>
          </div>

          <div className="grid gap-3 grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1" htmlFor="architecture-select">
                Architecture
              </label>
              <select
                id="architecture-select"
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                disabled={isTraining}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none disabled:opacity-50"
              >
                <option value="Neural Network">Neural Net</option>
                <option value="Random Forest">Random Forest</option>
                <option value="Linear Regression">Linear Reg</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Epochs: <span className="text-cyan-400 font-bold">{epochs}</span>
              </label>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={epochs}
                onChange={(e) => setEpochs(Number(e.target.value))}
                disabled={isTraining}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400 disabled:opacity-50 mt-2"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
              <label htmlFor="learning-rate">Learning Rate (α)</label>
              <span className={learningRate > 0.12 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {learningRate} {learningRate > 0.12 ? '(Explodes Loss)' : '(Optimal)'}
              </span>
            </div>
            <input
              id="learning-rate"
              type="range"
              min="0.005"
              max="0.25"
              step="0.005"
              value={learningRate}
              onChange={(e) => setLearningRate(Number(e.target.value))}
              disabled={isTraining}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400 disabled:opacity-50 mt-1"
            />
          </div>

          <div className="border-t border-slate-800/80 pt-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-semibold text-slate-300">AI Agent Throttle Control</h4>
                <p className="text-[10px] text-slate-500">Autonomous cruise engine tuning</p>
              </div>
              <button
                type="button"
                onClick={onToggleAIAgent}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${
                  aiAgentOptimized ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-slate-950 transition-transform duration-300 ${
                    aiAgentOptimized ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTrain}
            disabled={isTraining}
            className={`w-full rounded-full py-2.5 text-xs font-bold text-slate-950 transition duration-300 ${
              isTraining ? 'bg-slate-800 text-slate-500 cursor-wait' : 'bg-cyan-500 hover:bg-cyan-400'
            }`}
          >
            {isTraining ? `Training (Epoch ${currentEpoch}/${epochs})...` : 'Train AI Model'}
          </button>
        </div>

        {/* Right Training Chart Dashboard */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-slate-300">Live Training Metrics</h3>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Target Accuracy:</span>
                <p className={`text-base font-bold ${
                  modelState[selectedModel]?.trained
                    ? modelState[selectedModel]?.isErratic
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                    : 'text-slate-500'
                }`}>
                  {modelState[selectedModel]?.trained
                    ? `${modelState[selectedModel]?.accuracy.toFixed(1)}%`
                    : 'Untrained'
                  }
                </p>
              </div>
            </div>

            <div className="h-44 w-full">
              {liveHistory.length === 0 && !isTraining ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <span className="text-slate-600 text-3xl font-bold">No Metrics</span>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-normal">
                    Select your model, configure the hyperparameters on the left, and click train to start live training.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={liveHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 10 }} domain={[0, 1]} label={{ value: 'Loss', angle: -90, position: 'insideLeft', style: { fill: '#38bdf8', fontSize: 10 } }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 10 }} domain={[20, 100]} label={{ value: 'Accuracy (%)', angle: 90, position: 'insideRight', style: { fill: '#10b981', fontSize: 10 } }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="loss" stroke="#38bdf8" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] text-slate-400">
            <div>
              Status: <span className={`font-semibold ${
                isTraining 
                  ? 'text-cyan-400' 
                  : modelState[selectedModel]?.trained 
                    ? modelState[selectedModel]?.isErratic 
                      ? 'text-rose-400 font-bold' 
                      : 'text-emerald-400' 
                    : 'text-slate-500'
              }`}>
                {isTraining ? 'Training...' : modelState[selectedModel]?.trained ? modelState[selectedModel]?.isErratic ? 'Model Diverged' : 'Model Tuned' : 'Untrained'}
              </span>
            </div>
            {modelState[selectedModel]?.trained && (
              <div>
                Tuned via {modelState[selectedModel]?.type} (α={modelState[selectedModel]?.lr})
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
