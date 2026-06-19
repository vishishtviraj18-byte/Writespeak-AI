import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../hooks/useProgress';
import AnimatedBackground from './AnimatedBackground';
import { ArrowLeft, Award, TrendingUp, Calendar, Heart, FileText, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const { progress, level } = useProgress();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await authFetch('http://localhost:8080/api/test/history');
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to load test history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // SVG Chart data rendering helper
  const renderTrendChart = () => {
    if (history.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-slate-400 font-bold bg-slate-50 rounded-2xl border-2 border-slate-100">
          Complete some tests to visualize learning trends! 📈
        </div>
      );
    }

    // Limit to last 7 tests, reverse to make chronological
    const chartData = [...history].slice(0, 7).reverse();
    const width = 500;
    const height = 150;
    const padding = 20;

    const points = chartData.map((test, idx) => {
      const x = padding + (idx * (width - padding * 2)) / (Math.max(1, chartData.length - 1));
      const y = height - padding - (test.accuracy * (height - padding * 2)) / 100;
      return { x, y, accuracy: test.accuracy, date: new Date(test.date || Date.now()).toLocaleDateString() };
    });

    const pathD = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    return (
      <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Accuracy Trend (% Correct)</h3>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#E2E8F0" strokeDasharray="4 4" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#E2E8F0" strokeDasharray="4 4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#CBD5E1" strokeWidth="2" />

          {/* Line Path */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#00A5DC"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r="6"
                fill="#FF5E7E"
                stroke="#FFF"
                strokeWidth="2"
                className="cursor-pointer hover:scale-125 transition-transform"
              />
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fontSize="10"
                fontWeight="900"
                fill="#1E293B"
              >
                {Math.round(p.accuracy)}%
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden font-nunito bg-back text-slate-800">
      <AnimatedBackground />

      {/* Header */}
      <div className="z-10 bg-white/95 border-b-4 border-white backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-md relative">
        <button 
          onClick={() => navigate('/mode-selection')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-black cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          👨‍👩-👦 Parent Performance Portal
        </h1>
        <div className="w-24"></div> {/* spacer */}
      </div>

      {/* Portal main area */}
      <div className="z-10 flex-1 overflow-y-auto p-6 max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: general progress metrics */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="glass-panel p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-doraBlue border-4 border-white rounded-full flex items-center justify-center text-4xl shadow-md">
                🎓
              </div>
              <h2 className="text-2xl font-black text-slate-800 mt-4 leading-none">Learning Stats</h2>
              <span className="text-xs font-black text-slate-400 mt-1 uppercase">Doraemon Companion Guide</span>

              <div className="w-full space-y-3 mt-6 text-left">
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                  <span className="text-xs font-black text-slate-400">XP SCORE</span>
                  <span className="font-black text-emerald-600 text-lg">{progress.score} XP</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                  <span className="text-xs font-black text-slate-400">GOLD STARS</span>
                  <span className="font-black text-yellow-600 text-lg">🌟 {progress.stars}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                  <span className="text-xs font-black text-slate-400">ACTIVE STREAK</span>
                  <span className="font-black text-primary text-lg">🔥 {progress.streak} days</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                  <span className="text-xs font-black text-slate-400">LEARNING ACCURACY</span>
                  <span className="font-black text-doraBlue text-lg">🎯 {Math.round(progress.accuracy)}%</span>
                </div>
              </div>
            </div>

            {/* Completed components */}
            <div className="glass-panel p-6">
              <h3 className="font-black text-slate-800 text-lg mb-4">Completed Items</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-black text-slate-400 mb-1">
                    <span>ALPHABETS PRACTICE</span>
                    <span>{progress.alphabetsDone?.length || 0} / 26</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${((progress.alphabetsDone?.length || 0) / 26) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black text-slate-400 mb-1">
                    <span>NUMBERS PRACTICE</span>
                    <span>{progress.numbersDone?.length || 0} / 10</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="bg-secondary h-full rounded-full"
                      style={{ width: `${((progress.numbersDone?.length || 0) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: chart and test history logs */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Chart */}
            {renderTrendChart()}

            {/* History logs table */}
            <div className="bg-white border-2 border-slate-100 rounded-[28px] p-6 shadow-sm overflow-hidden flex-1">
              <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-500" /> Assessment Log History
              </h3>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-2"></div>
                  <span className="text-sm text-slate-400 font-bold">Retrieving logs...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center text-slate-400 font-bold py-12">
                  No assessment results logged yet. Let's take a Test! 📝
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-100 text-xs font-black text-slate-400 uppercase">
                        <th className="pb-3 pl-2">Date</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Correct</th>
                        <th className="pb-3">Accuracy</th>
                        <th className="pb-3">Grade</th>
                        <th className="pb-3 text-right pr-2">Bonus XP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-600">
                      {history.map((test) => (
                        <tr key={test.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 pl-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {new Date(test.date || Date.now()).toLocaleDateString()}
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-black border ${
                              test.testType === 'NUMBER' 
                                ? 'bg-teal-50 text-teal-600 border-teal-100'
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                              {test.testType}
                            </span>
                          </td>
                          <td className="py-3.5">
                            {test.correctAnswers} / {test.totalQuestions}
                          </td>
                          <td className="py-3.5 text-slate-800 font-black">
                            {Math.round(test.accuracy)}%
                          </td>
                          <td className="py-3.5 text-primary font-black">
                            {test.grade?.split(" ")[0]}
                          </td>
                          <td className="py-3.5 text-right pr-2 text-emerald-600 font-black">
                            +{test.score}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
