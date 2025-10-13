import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const StudyTimer = () => {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState('study'); // 'study', 'shortBreak', 'longBreak'
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef(null);

  const sessionSettings = useMemo(() => ({
    study: { duration: 25 * 60, label: 'Study Time', color: 'bg-blue-500' },
    shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'bg-green-500' },
    longBreak: { duration: 15 * 60, label: 'Long Break', color: 'bg-purple-500' }
  }), []);

  const switchSession = useCallback((newSessionType) => {
    setSessionType(newSessionType);
    setTime(sessionSettings[newSessionType].duration);
    setIsRunning(false);
  }, [sessionSettings]);

  const handleSessionComplete = useCallback(() => {
    if (sessionType === 'study') {
      setCompletedSessions(prev => prev + 1);
      // Auto switch to break
      const nextSession = (completedSessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
      switchSession(nextSession);
    } else {
      // After break, switch back to study
      switchSession('study');
    }
    
    // Play notification sound (optional)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${sessionSettings[sessionType].label} completed!`);
    }
  }, [sessionType, completedSessions, switchSession, sessionSettings]);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      handleSessionComplete();
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, time, handleSessionComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTime(sessionSettings[sessionType].duration);
  };

  const progress = ((sessionSettings[sessionType].duration - time) / sessionSettings[sessionType].duration) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Study Timer</h1>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${sessionSettings[sessionType].color}`}></div>
            <span className="text-white/80 text-lg">{sessionSettings[sessionType].label}</span>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-in-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Timer Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-mono font-bold text-white mb-2">
                {formatTime(time)}
              </div>
              <div className="text-white/60 text-sm">
                {isRunning ? 'Running' : 'Paused'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 ${
              isRunning 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25' 
                : 'bg-green-500 hover:bg-green-600 shadow-green-500/25'
            } shadow-lg`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          
          <button
            onClick={resetTimer}
            className="px-8 py-3 rounded-xl font-semibold text-white bg-gray-600 hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-gray-600/25"
          >
            Reset
          </button>
        </div>

        {/* Session Selector */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {Object.entries(sessionSettings).map(([key, setting]) => (
            <button
              key={key}
              onClick={() => switchSession(key)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                sessionType === key
                  ? 'bg-white/20 text-white border-2 border-white/30'
                  : 'bg-white/5 text-white/70 border-2 border-transparent hover:bg-white/10'
              }`}
            >
              {setting.label}
            </button>
          ))}
        </div>

        {/* Statistics */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-white/70 text-sm">Completed Sessions</span>
            <span className="text-white font-bold text-lg">{completedSessions}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-white/70 text-sm">Total Study Time</span>
            <span className="text-white font-bold text-lg">
              {Math.floor(completedSessions * 25 / 60)}h {(completedSessions * 25) % 60}m
            </span>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 text-center">
          <p className="text-white/50 text-xs">
            💡 Tip: Take breaks to maintain focus and productivity
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
