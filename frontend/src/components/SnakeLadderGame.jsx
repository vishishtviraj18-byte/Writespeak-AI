import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../hooks/useProgress';
import AnimatedBackground from './AnimatedBackground';
import CartoonMascot from './CartoonMascot';
import { ArrowLeft, RefreshCw, Dices } from 'lucide-react';
import confetti from 'canvas-confetti';
import gsap from 'gsap';

// Board mappings
const LADDERS = {
  3: 38,
  4: 14,
  9: 31,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100
};

const SNAKES = {
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  98: 79
};

const getGridCoords = (pos) => {
  const row = Math.floor((pos - 1) / 10);
  let col = (pos - 1) % 10;
  if (row % 2 === 1) {
    col = 9 - col;
  }
  return {
    row: 9 - row, // 0 is top in CSS Grid
    col: col
  };
};

const SnakeLadderGame = () => {
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const { progress, awardBonus, refreshProgress } = useProgress();

  const [pPos, setPPos] = useState(1);
  const [doraPos, setDoraPos] = useState(1);
  const [turn, setTurn] = useState('player'); // player | dora | finished
  const [diceVal, setDiceVal] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [status, setStatus] = useState("Your turn! Roll the dice! 🎲");
  const [statusEmoji, setStatusEmoji] = useState('🐱');
  const [winner, setWinner] = useState(null);

  const diceRef = useRef(null);
  const pTokenRef = useRef(null);
  const dTokenRef = useRef(null);

  // Voice output
  const speak = (msg) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.rate = 0.95;
      utterance.pitch = 1.3;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    speak("Let's play Snakes and Ladders with Doraemon! Roll the dice to start!");
  }, []);

  // AI Doraemon turn trigger
  useEffect(() => {
    if (turn === 'dora' && !winner) {
      setStatus("Doraemon is thinking... 🤔");
      setStatusEmoji('🤔');
      
      const timer = setTimeout(() => {
        handleRollDora();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [turn]);

  // Roll dice animation helper
  const animateDice = () => {
    setRolling(true);
    const tl = gsap.timeline();
    tl.to(diceRef.current, { rotation: 360, scale: 1.3, duration: 0.4, ease: "power1.in" })
      .to(diceRef.current, { rotation: 720, scale: 1, duration: 0.4, ease: "bounce.out" });
  };

  const handleRollPlayer = () => {
    if (rolling || turn !== 'player' || winner) return;

    animateDice();
    
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceVal(roll);
      setRolling(false);
      
      let nextPos = pPos + roll;
      if (nextPos >= 100) {
        nextPos = 100;
        setPPos(100);
        handleWin('player');
        return;
      }

      // Check snakes or ladders
      let climb = false;
      let slide = false;
      let finalPos = nextPos;
      
      if (LADDERS[nextPos]) {
        finalPos = LADDERS[nextPos];
        climb = true;
      } else if (SNAKES[nextPos]) {
        finalPos = SNAKES[nextPos];
        slide = true;
      }

      setPPos(finalPos);

      // Animate player token
      gsap.fromTo(pTokenRef.current, 
        { scale: 1.5, opacity: 0.5 }, 
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out" }
      );

      if (climb) {
        setStatus(`You rolled a ${roll}! Climbing a ladder from ${nextPos} to ${finalPos}! 🪜🚀`);
        setStatusEmoji('😎');
        speak(`You rolled a ${roll} and climbed a ladder! Amazing!`);
      } else if (slide) {
        setStatus(`You rolled a ${roll}! Oh no, swallowed by a snake down to ${finalPos}! 🐍🥺`);
        setStatusEmoji('🥺');
        speak(`You rolled a ${roll}. Oh, a snake caught you!`);
      } else {
        setStatus(`You rolled a ${roll}! Moved to cell ${finalPos}. 🎲`);
        setStatusEmoji('🐱');
        speak(`You rolled a ${roll} and moved to ${finalPos}.`);
      }

      if (finalPos === 100) {
        handleWin('player');
      } else {
        setTurn('dora');
      }
    }, 800);
  };

  const handleRollDora = () => {
    animateDice();

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceVal(roll);
      setRolling(false);
      
      let nextPos = doraPos + roll;
      if (nextPos >= 100) {
        nextPos = 100;
        setDoraPos(100);
        handleWin('dora');
        return;
      }

      let climb = false;
      let slide = false;
      let finalPos = nextPos;
      
      if (LADDERS[nextPos]) {
        finalPos = LADDERS[nextPos];
        climb = true;
      } else if (SNAKES[nextPos]) {
        finalPos = SNAKES[nextPos];
        slide = true;
      }

      setDoraPos(finalPos);

      // Animate Doraemon token
      gsap.fromTo(dTokenRef.current, 
        { scale: 1.5, opacity: 0.5 }, 
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out" }
      );

      if (climb) {
        setStatus(`Doraemon rolled a ${roll} and climbed a ladder to ${finalPos}! 🪜`);
        setStatusEmoji('😲');
        speak(`Doraemon rolled a ${roll} and climbed a ladder!`);
      } else if (slide) {
        setStatus(`Doraemon rolled a ${roll} and fell down a snake to ${finalPos}! 🐍`);
        setStatusEmoji('😂');
        speak(`Doraemon rolled a ${roll} and hit a snake!`);
      } else {
        setStatus(`Doraemon rolled a ${roll} and moved to cell ${finalPos}.`);
        setStatusEmoji('🐱');
        speak(`Doraemon rolled a ${roll} and is now at ${finalPos}.`);
      }

      if (finalPos === 100) {
        handleWin('dora');
      } else {
        setTurn('player');
      }
    }, 800);
  };

  const handleWin = async (winnerName) => {
    setWinner(winnerName);
    setTurn('finished');
    if (winnerName === 'player') {
      setStatus("Congratulations! You won the game! 🏆🌟");
      setStatusEmoji('🏆');
      speak("Yahoo! You won the game! You get 50 bonus stars!");
      confetti({ particleCount: 150, spread: 80 });

      // Save bonus points to MongoDB
      try {
        await awardBonus(100, 50); // +100 score, +50 stars
      } catch (err) {
        console.error(err);
      }
    } else {
      setStatus("Doraemon won! Better luck next time! 🐱💙");
      setStatusEmoji('🥺');
      speak("Doraemon won the game! Let's play another match to beat him!");
    }
    refreshProgress();
  };

  const resetGame = () => {
    setPPos(1);
    setDoraPos(1);
    setDiceVal(1);
    setWinner(null);
    setTurn('player');
    setStatus("Game restarted! Roll the dice! 🎲");
    setStatusEmoji('🐱');
  };

  // Render board cells grid (100 cells)
  const renderCells = () => {
    const cells = [];
    for (let r = 9; r >= 0; r--) {
      const isRowEven = r % 2 === 0;
      for (let c = 0; c < 10; c++) {
        let cellNum;
        if (isRowEven) {
          cellNum = (r * 10) + c + 1;
        } else {
          cellNum = (r * 10) + (9 - c) + 1;
        }

        // Alternating colors
        const colors = [
          'bg-rose-50 text-rose-500 border-rose-100',
          'bg-teal-50 text-teal-500 border-teal-100',
          'bg-yellow-50 text-yellow-600 border-yellow-100',
          'bg-sky-50 text-sky-500 border-sky-100'
        ];
        const cellColor = colors[cellNum % 4];

        // check snakes/ladders indicators
        let indicator = null;
        if (LADDERS[cellNum]) {
          indicator = <span className="absolute bottom-1 right-1 text-xs">🪜→{LADDERS[cellNum]}</span>;
        } else if (SNAKES[cellNum]) {
          indicator = <span className="absolute bottom-1 right-1 text-xs text-rose-600">🐍→{SNAKES[cellNum]}</span>;
        }

        cells.push(
          <div
            key={cellNum}
            className={`relative flex items-center justify-center font-black text-sm md:text-base border ${cellColor} shadow-inner aspect-square`}
          >
            <span>{cellNum}</span>
            {indicator}
          </div>
        );
      }
    }
    return cells;
  };

  const playerCoords = getGridCoords(pPos);
  const doraCoords = getGridCoords(doraPos);

  return (
    <div className="relative w-screen h-screen flex flex-col md:flex-row overflow-hidden font-nunito bg-back text-slate-800 select-none">
      <AnimatedBackground />
      <CartoonMascot message={status} emoji={statusEmoji} />

      {/* Control panel left */}
      <div className="z-10 w-full md:w-[350px] bg-white/95 border-b-4 md:border-b-0 md:border-r-4 border-white backdrop-blur-md p-6 flex flex-col justify-between shadow-xl relative overflow-y-auto">
        <div>
          {/* Back button */}
          <button 
            onClick={() => navigate('/mode-selection')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-black mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>

          <h2 className="text-3xl font-black text-slate-800 leading-none mb-1">Snakes & Ladders</h2>
          <span className="text-xs font-black text-doraBlue bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 mt-1 inline-block">
            🎲 Dice Roll Board Game
          </span>

          <div className="my-6 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-center shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Turn Indicator</h3>
            {winner ? (
              <div className="text-2xl font-black text-primary">🎉 MATCH ENDED</div>
            ) : (
              <div className="text-2xl font-black text-slate-800 uppercase tracking-wide">
                {turn === 'player' ? '👉 YOUR TURN' : '🤖 DORAEMON IS ROLLING'}
              </div>
            )}
          </div>

          {/* Dice display */}
          <div className="flex flex-col items-center my-6">
            <div 
              ref={diceRef}
              onClick={handleRollPlayer}
              className={`w-24 h-24 bg-white border-4 border-slate-200 rounded-[24px] shadow-lg flex items-center justify-center text-5xl font-black cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                turn === 'player' && !rolling && !winner ? 'border-primary ring-4 ring-rose-200' : 'opacity-75 cursor-not-allowed'
              }`}
            >
              {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][diceVal - 1]}
            </div>
            <p className="text-xs text-slate-400 font-bold mt-2">
              {turn === 'player' && !winner ? 'Tap the dice to roll!' : `Rolled: ${diceVal}`}
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={resetGame}
            className="w-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 text-slate-600 font-black py-3 rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" /> Reset Board
          </button>
        </div>
      </div>

      {/* Board layout panel */}
      <div className="z-10 flex-1 flex flex-col justify-center items-center p-6 relative">
        <div className="relative w-full max-w-[500px] border-8 border-white bg-white rounded-[32px] shadow-2xl overflow-hidden aspect-square grid grid-cols-10 grid-rows-10">
          {renderCells()}

          {/* Tokens container overlay */}
          <div className="absolute inset-0 pointer-events-none p-[2px]">
            {/* Player Token (Boy/Girl/Other avatar) */}
            <div
              ref={pTokenRef}
              className="absolute w-[8%] h-[8%] bg-primary border-2 border-white rounded-full flex items-center justify-center text-xs md:text-sm shadow-md transition-all duration-500 ease-out"
              style={{
                top: `${playerCoords.row * 10 + 1}%`,
                left: `${playerCoords.col * 10 + 1}%`,
                transform: 'translate(0, 0)',
                zIndex: 30
              }}
            >
              👦
            </div>

            {/* Doraemon AI Token */}
            <div
              ref={dTokenRef}
              className="absolute w-[8%] h-[8%] bg-doraBlue border-2 border-white rounded-full flex items-center justify-center text-xs md:text-sm shadow-md transition-all duration-500 ease-out"
              style={{
                top: `${doraCoords.row * 10 + 1}%`,
                left: `${doraCoords.col * 10 + 1}%`,
                transform: 'translate(10%, 10%)',
                zIndex: 29
              }}
            >
              🐱
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex gap-4 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1">🪜 Ladder: Climb up!</span>
          <span className="flex items-center gap-1 text-rose-600">🐍 Snake: Slither down!</span>
        </div>
      </div>
    </div>
  );
};

export default SnakeLadderGame;
