import { useState, useRef, useEffect } from 'react';
import type {
  Difficulty,
  ScreenState,
  PersonalBests,
  AnswerResult,
  FlagRushResult,
  FlagRushPersonalBest,
} from './types/game';
import { DIFFICULTY_CONFIGS } from './types/game';
import { CountryPoolManager } from './utils/gamePool';
import { loadPersonalBests, savePersonalBest, loadFlagRushBest, saveFlagRushBest } from './utils/storage';
import { soundEngine } from './utils/soundEngine';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { ClassicInfoModal } from './components/ClassicInfoModal';
import { FlagRushCountdown } from './components/FlagRushCountdown';
import { FlagRushScreen } from './components/FlagRushScreen';
import { FlagRushResults } from './components/FlagRushResults';
import type { Country } from './data/countries';
import { countries } from './data/countries';
import './App.css';

export function App() {
  const [screen, setScreen] = useState<ScreenState>('home');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [personalBests, setPersonalBests] = useState<PersonalBests>(loadPersonalBests);
  const [flagRushBest, setFlagRushBest] = useState<FlagRushPersonalBest>(loadFlagRushBest);

  // Pool manager instance for Classic Mode
  const poolRef = useRef<CountryPoolManager>(new CountryPoolManager());

  // Classic Game Session State
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [hint, setHint] = useState<string | null>(null);
  const [hintUsed, setHintUsed] = useState<boolean>(false);

  // Overall session metrics for classic game over screen
  const [totalAttempted, setTotalAttempted] = useState<number>(0);
  const [totalCorrect, setTotalCorrect] = useState<number>(0);

  // Classic New record flags
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [isNewBestStreak, setIsNewBestStreak] = useState<boolean>(false);

  // In-game Change Difficulty Modal state
  const [isChangeDifficultyOpen, setIsChangeDifficultyOpen] = useState<boolean>(false);

  // Flag Rush Session State
  const [flagRushResult, setFlagRushResult] = useState<FlagRushResult | null>(null);
  const [isNewFlagRushRecord, setIsNewFlagRushRecord] = useState<boolean>(false);

  // Visual QA Preview URL Parameters (?preview=gameover | ?preview=timesup | ?preview=flagrush | ?testFlag=au)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const testCode = params.get('testFlag');
    const preview = params.get('preview');

    if (preview === 'gameover') {
      setTotalAttempted(12);
      setTotalCorrect(10);
      setScore(180);
      setHighestStreak(7);
      setIsNewHighScore(true);
      setIsNewBestStreak(true);
      setScreen('gameover');
      return;
    }

    if (preview === 'timesup') {
      const mockResult: FlagRushResult = {
        score: 24,
        totalAttempted: 27,
        totalCorrect: 24,
        totalIncorrect: 3,
        accuracy: 88.9,
        longestStreak: 8,
        unansweredCountry: countries[5],
        history: [
          { country: countries[0], userAnswer: countries[0].name, isCorrect: true, hintUsed: false, timestamp: Date.now() },
          { country: countries[1], userAnswer: 'Wrongland', isCorrect: false, hintUsed: true, timestamp: Date.now() },
          { country: countries[2], userAnswer: countries[2].name, isCorrect: true, hintUsed: false, timestamp: Date.now() },
          { country: countries[3], userAnswer: countries[3].name, isCorrect: true, hintUsed: false, timestamp: Date.now() },
        ],
        isNewHighScore: true,
      };
      setFlagRushResult(mockResult);
      setIsNewFlagRushRecord(true);
      setScreen('flagrush-results');
      return;
    }

    if (preview === 'flagrush' || preview === 'flagrush-feedback') {
      setScreen('flagrush-playing');
      return;
    }

    if (preview === 'countdown') {
      setScreen('flagrush-countdown');
      return;
    }

    if (preview === 'reveal') {
      const targetCountry = countries.find(c => c.code.toLowerCase() === (testCode || 'br').toLowerCase()) || countries[0];
      setCurrentCountry(targetCountry);
      setScreen('playing');
      return;
    }

    if (testCode) {
      const targetCountry = countries.find(c => c.code.toLowerCase() === testCode.toLowerCase());
      if (targetCountry) {
        setCurrentCountry(targetCountry);
        setScreen('playing');
      }
    }
  }, []);

  // ==========================================
  // CLASSIC EXPEDITION HANDLERS
  // ==========================================

  const handleStartClassicGame = (newDiff?: Difficulty) => {
    const diffToUse = newDiff || difficulty;
    if (newDiff) setDifficulty(newDiff);
    setIsChangeDifficultyOpen(false);

    const config = DIFFICULTY_CONFIGS[diffToUse];
    poolRef.current.reset(diffToUse);

    const { country } = poolRef.current.getNextCountry();
    setCurrentCountry(country);
    setQuestionNumber(1);
    setScore(0);
    setStreak(0);
    setHighestStreak(0);
    setLives(config.startingLives);
    setHint(null);
    setHintUsed(false);
    setTotalAttempted(0);
    setTotalCorrect(0);
    setIsNewHighScore(false);
    setIsNewBestStreak(false);

    setScreen('playing');
    soundEngine.playTrack('gameplay');
  };

  const handleRequestHint = () => {
    if (!currentCountry || hintUsed) return;
    const config = DIFFICULTY_CONFIGS[difficulty];

    const selectedHint = poolRef.current.getRandomHint(currentCountry);
    setHint(selectedHint);
    setHintUsed(true);

    if (config.hintCost > 0) {
      const remainingLives = lives - config.hintCost;
      setLives(remainingLives);
      if (remainingLives <= 0) {
        finishClassicGame(score, highestStreak, totalCorrect);
      }
    }
  };

  const handleSubmitAnswer = (result: AnswerResult) => {
    setTotalAttempted((prev) => prev + 1);

    if (result.isCorrect) {
      const newScore = score + result.pointsEarned;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      setHighestStreak((prev) => Math.max(prev, newStreak));
      setTotalCorrect((prev) => prev + 1);
    } else {
      setStreak(0);
      const remainingLives = lives - 1;
      setLives(remainingLives);
    }
  };

  const handleNextFlag = () => {
    if (lives <= 0) {
      finishClassicGame(score, highestStreak, totalCorrect);
      return;
    }

    const { country } = poolRef.current.getNextCountry();
    setCurrentCountry(country);
    setQuestionNumber((prev) => prev + 1);
    setHint(null);
    setHintUsed(false);
  };

  const finishClassicGame = (finalScore: number, finalBestStreak: number, finalCorrect: number) => {
    const { bests, isNewHighScore: newHigh, isNewBestStreak: newStreak } = savePersonalBest(
      difficulty,
      finalScore,
      finalBestStreak,
      finalCorrect
    );

    setPersonalBests(bests);
    setIsNewHighScore(newHigh);
    setIsNewBestStreak(newStreak);
    setScreen('gameover');
    soundEngine.pauseMusic();
  };

  // ==========================================
  // FLAG RUSH SPEEDRUN HANDLERS
  // ==========================================

  const handleStartFlagRushCountdown = () => {
    soundEngine.pauseMusic();
    setScreen('flagrush-countdown');
  };

  const handleFlagRushCountdownComplete = () => {
    setScreen('flagrush-playing');
  };

  const handleFlagRushFinish = (result: FlagRushResult) => {
    const { best, isNewHighScore: newRecord } = saveFlagRushBest(
      result.score,
      result.longestStreak,
      result.totalCorrect
    );

    setFlagRushBest(best);
    setIsNewFlagRushRecord(newRecord);
    setFlagRushResult(result);
    setScreen('flagrush-results');
  };

  // ==========================================
  // SHARED NAVIGATION
  // ==========================================

  const handleReturnHome = () => {
    setScreen('home');
    soundEngine.playTrack('intro');
  };

  return (
    <div className={`app-root theme-vintage difficulty-${difficulty}`}>
      {screen === 'home' && (
        <HomeScreen
          selectedDifficulty={difficulty}
          onSelectDifficulty={setDifficulty}
          onStartClassic={handleStartClassicGame}
          onStartFlagRushCountdown={handleStartFlagRushCountdown}
          personalBests={personalBests}
          flagRushBest={flagRushBest}
        />
      )}

      {screen === 'playing' && currentCountry && (
        <GameScreen
          difficulty={difficulty}
          country={currentCountry}
          questionNumber={questionNumber}
          score={score}
          streak={streak}
          lives={lives}
          hint={hint}
          hintUsed={hintUsed}
          onRequestHint={handleRequestHint}
          onSubmitAnswer={handleSubmitAnswer}
          onNextFlag={handleNextFlag}
          onChangeDifficulty={() => setIsChangeDifficultyOpen(true)}
          onExitGame={handleReturnHome}
        />
      )}

      {screen === 'gameover' && (
        <GameOverScreen
          difficulty={difficulty}
          finalScore={score}
          totalAttempted={totalAttempted}
          totalCorrect={totalCorrect}
          highestStreak={highestStreak}
          personalBests={personalBests}
          isNewHighScore={isNewHighScore}
          isNewBestStreak={isNewBestStreak}
          onPlayAgain={() => setIsChangeDifficultyOpen(true)}
          onReturnHome={handleReturnHome}
        />
      )}

      {screen === 'flagrush-countdown' && (
        <FlagRushCountdown onCountdownComplete={handleFlagRushCountdownComplete} />
      )}

      {screen === 'flagrush-playing' && (
        <FlagRushScreen
          onFinish={handleFlagRushFinish}
          onExit={handleReturnHome}
        />
      )}

      {screen === 'flagrush-results' && flagRushResult && (
        <FlagRushResults
          result={flagRushResult}
          personalBest={flagRushBest}
          isNewRecord={isNewFlagRushRecord}
          onReturnHome={handleReturnHome}
        />
      )}

      {/* Global Change Difficulty Modal (accessible anytime from GameScreen or GameOverScreen) */}
      <ClassicInfoModal
        isOpen={isChangeDifficultyOpen}
        onClose={() => setIsChangeDifficultyOpen(false)}
        selectedDifficulty={difficulty}
        onSelectDifficulty={setDifficulty}
        onStartGame={() => handleStartClassicGame(difficulty)}
        personalBests={personalBests}
      />
    </div>
  );
}

export default App;
