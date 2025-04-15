import * as React from 'react';
import styles from './EasterEggHuntGame.module.scss';
import type { IEasterEggHuntGameProps } from './IEasterEggHuntGameProps';
import { escape } from '@microsoft/sp-lodash-subset';

// Interfaces for the game state and egg objects
interface IEgg {
  id: number;
  x: number;
  y: number;
  isBonus: boolean;
  isFound: boolean;
}

interface IGameState {
  isGameStarted: boolean;
  isGameOver: boolean;
  score: number;
  timeLeft: number;
  eggs: IEgg[];
  gameAreaWidth: number;
  gameAreaHeight: number;
}

export default class EasterEggHuntGame extends React.Component<IEasterEggHuntGameProps, IGameState> {
  private timerInterval: number | null = null;
  private gameAreaRef: React.RefObject<HTMLDivElement>;

  constructor(props: IEasterEggHuntGameProps) {
    super(props);
    this.gameAreaRef = React.createRef();

    this.state = {
      isGameStarted: false,
      isGameOver: false,
      score: 0,
      timeLeft: props.gameDuration,
      eggs: [],
      gameAreaWidth: 0,
      gameAreaHeight: 0
    };
  }

  // When component mounts, set up the game area dimensions
  public componentDidMount(): void {
    this.updateGameAreaDimensions();
    window.addEventListener('resize', this.updateGameAreaDimensions);
  }

  // Clean up event listeners and timer when component unmounts
  public componentWillUnmount(): void {
    window.removeEventListener('resize', this.updateGameAreaDimensions);
    this.stopTimer();
  }

  // Update game area dimensions for responsive design
  private updateGameAreaDimensions = (): void => {
    if (this.gameAreaRef.current) {
      this.setState({
        gameAreaWidth: this.gameAreaRef.current.offsetWidth,
        gameAreaHeight: this.gameAreaRef.current.offsetHeight
      });
    }
  }

  // Start the game timer
  private startTimer = (): void => {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = window.setInterval(() => {
      if (this.state.timeLeft > 0) {
        this.setState(prevState => ({
          timeLeft: prevState.timeLeft - 1
        }));
      } else {
        this.endGame();
      }
    }, 1000);
  }

  // Stop the game timer
  private stopTimer = (): void => {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Start a new game
  private startGame = (): void => {
    // Reset the game state
    this.setState({
      isGameStarted: true,
      isGameOver: false,
      score: 0,
      timeLeft: this.props.gameDuration,
      eggs: this.generateEggs()
    }, () => {
      this.startTimer();
    });
  }

  // End the current game
  private endGame = (): void => {
    this.stopTimer();
    this.setState({
      isGameOver: true,
      isGameStarted: false
    });
  }

  // Generate eggs with random positions
  private generateEggs = (): IEgg[] => {
    const eggs: IEgg[] = [];
    const totalEggs = this.props.numberOfEggs + this.props.numberOfBonusEggs;
    const eggSize = 50; // Size of the egg in pixels
    
    // Make sure we have game area dimensions
    if (this.state.gameAreaWidth === 0 || this.state.gameAreaHeight === 0) {
      this.updateGameAreaDimensions();
    }
    
    const maxX = this.state.gameAreaWidth - eggSize;
    const maxY = this.state.gameAreaHeight - eggSize;
    
    // Generate regular eggs
    for (let i = 0; i < this.props.numberOfEggs; i++) {
      eggs.push({
        id: i,
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY),
        isBonus: false,
        isFound: false
      });
    }
    
    // Generate bonus eggs
    for (let i = this.props.numberOfEggs; i < totalEggs; i++) {
      eggs.push({
        id: i,
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY),
        isBonus: true,
        isFound: false
      });
    }
    
    return eggs;
  }

  // Handle egg click event
  private handleEggClick = (eggId: number): void => {
    this.setState(prevState => {
      const updatedEggs = prevState.eggs.map(egg => {
        if (egg.id === eggId && !egg.isFound) {
          // Found egg, mark it as found
          return { ...egg, isFound: true };
        }
        return egg;
      });
      
      // Find the clicked egg to calculate score
      const clickedEgg = prevState.eggs.filter(egg => egg.id === eggId)[0];
      const scoreIncrement = clickedEgg && !clickedEgg.isFound ? 
        (clickedEgg.isBonus ? 5 : 1) : 0;
      
      return {
        eggs: updatedEggs,
        score: prevState.score + scoreIncrement
      };
    });
    
    // Check if all eggs are found to end the game early
    if (this.state.eggs.every(egg => egg.isFound)) {
      this.endGame();
    }
  }
  
  // Render game UI
  public render(): React.ReactElement<IEasterEggHuntGameProps> {
    const { hasTeamsContext, userDisplayName } = this.props;
    const { isGameStarted, isGameOver, score, timeLeft, eggs } = this.state;
    
    return (
      <section className={`${styles.easterEggHuntGame} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.gameHeader}>
          <h2 className={styles.gameTitle}>Easter Egg Hunt Game</h2>
          <p className={styles.welcome}>Welcome, {escape(userDisplayName)}!</p>
        </div>
        
        <div className={styles.gameInfo}>
          <div className={styles.scoreTimer}>
            <div className={styles.score}>Score: {score}</div>
            <div className={styles.timer}>Time Left: {timeLeft}s</div>
          </div>
          
          {!isGameStarted && !isGameOver && (
            <div className={styles.startGameContainer}>
              <p className={styles.instructions}>
                Click "Start Game" to begin hunting for Easter eggs! Regular eggs are worth 1 point and golden eggs are worth 5 points.
              </p>
              <button className={styles.startButton} onClick={this.startGame}>Start Game</button>
            </div>
          )}
          
          {isGameOver && (
            <div className={styles.gameOverContainer}>
              <h3 className={styles.gameOverTitle}>Game Over!</h3>
              <p className={styles.finalScore}>Final Score: {score}</p>
              <button className={styles.playAgainButton} onClick={this.startGame}>Play Again</button>
            </div>
          )}
        </div>
        
        <div 
          ref={this.gameAreaRef} 
          className={styles.gameArea}
          aria-label="Easter Egg Hunt Game Area"
          role="application"
        >
          {isGameStarted && eggs.map(egg => (
            <div
              key={egg.id}
              className={`${styles.egg} ${egg.isBonus ? styles.bonusEgg : ''} ${egg.isFound ? styles.eggFound : ''}`}
              style={{
                left: `${egg.x}px`,
                top: `${egg.y}px`
              }}
              onClick={() => !egg.isFound && this.handleEggClick(egg.id)}
              role="button"
              aria-label={egg.isBonus ? "Bonus Easter egg" : "Easter egg"}
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  !egg.isFound && this.handleEggClick(egg.id);
                }
              }}
            />
          ))}
        </div>
      </section>
    );
  }
}
