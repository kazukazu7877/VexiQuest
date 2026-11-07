import { useState, useRef, useEffect } from 'react';
import type { Difficulty, ScreenState, PersonalBests, AnswerResult } from './types/game';
import { DIFFICULTY_CONFIGS } from './types/game';
import { CountryPoolManager } from './utils/gamePool';
import { loadPersonalBests, savePersonalBest } from './utils/storage';
import { soundEngine } from './utils/soundEngine';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { GameOverScreen } from './components/GameOverScreen';
import type { Country } from './data/countries';
import { countries } from './data/countries';
import './App.css';

export function App() {
  const [screen, setScreen] = useState<ScreenState>('home');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [personalBests, setPersonalBests] = useState<PersonalBests>(loadPersonalBests);

  // Pool manager instance
  const poolRef = useRef<CountryPoolManager>(new CountryPoolManager());

  // Game Session State
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [hint, setHint] = useState<string | null>(null);
  const [hintUsed, setHintUsed] = useState<boolean>(false);

  // Overall session metrics for game over screen
  const [totalAttempted, setTotalAttempted] = useState<number>(0);
  const [totalCorrect, setTotalCorrect] = useState<number>(0);

  // New record flags
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [isNewBestStreak, setIsNewBestStreak] = useState<boolean>(false);

  // Support direct test flag query param (?testFlag=au) or preview state (?preview=gameover | ?preview=reveal) for visual QA
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


  // Start new journey
  const handleStartGame = () => {
    const config = DIFFICULTY_CONFIGS[difficulty];
    poolRef.current.reset(difficulty);

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

  // Request Hint
  const handleRequestHint = () => {
    if (!currentCountry || hintUsed) return;
    const config = DIFFICULTY_CONFIGS[difficulty];

    const selectedHint = poolRef.current.getRandomHint(currentCountry);
    setHint(selectedHint);
    setHintUsed(true);

    // In Medium difficulty, hint costs 1 life
    if (config.hintCost > 0) {
      const remainingLives = lives - config.hintCost;
      setLives(remainingLives);
      if (remainingLives <= 0) {
        // Player used their last life for a hint!
        finishGame(score, highestStreak, totalCorrect);
      }
    }
  };

  // Submit Answer
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

  // Advance to next flag (invoked after 2.5s or early skip)
  const handleNextFlag = () => {
    if (lives <= 0) {
      finishGame(score, highestStreak, totalCorrect);
      return;
    }

    const { country } = poolRef.current.getNextCountry();
    setCurrentCountry(country);
    setQuestionNumber((prev) => prev + 1);
    setHint(null);
    setHintUsed(false);
  };

  // Conclude game & save stats
  const finishGame = (finalScore: number, finalBestStreak: number, finalCorrect: number) => {
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

  // Return to homepage
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
          onStartGame={handleStartGame}
          personalBests={personalBests}
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
          onPlayAgain={handleStartGame}
          onReturnHome={handleReturnHome}
        />
      )}
    </div>
  );
}

export default App;
