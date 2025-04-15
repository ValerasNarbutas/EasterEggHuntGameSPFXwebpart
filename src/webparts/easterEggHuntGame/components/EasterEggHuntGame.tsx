import * as React from 'react';
import styles from './EasterEggHuntGame.module.scss';
import type { IEasterEggHuntGameProps } from './IEasterEggHuntGameProps';
import { EggSize, EggZone } from './IEasterEggHuntGameProps';
import { escape } from '@microsoft/sp-lodash-subset';

// Interfaces for the game state and egg objects
interface IEgg {
  id: number;
  x: number;
  y: number;
  isBonus: boolean;
  isFound: boolean;
  size: EggSize;
  zone: EggZone;
}

interface IGameState {
  isGameStarted: boolean;
  isGameOver: boolean;
  score: number;
  timeLeft: number;
  eggs: IEgg[];
  gameAreaWidth: number;
  gameAreaHeight: number;
  zoneDimensions: {[key in EggZone]: {width: number, height: number}};
}

export default class EasterEggHuntGame extends React.Component<IEasterEggHuntGameProps, IGameState> {
  private timerInterval: number | null = null;
  private zoneRefs: {[key in EggZone]: React.RefObject<HTMLDivElement>};

  constructor(props: IEasterEggHuntGameProps) {
    super(props);
    
    // Create refs for all egg zones
    this.zoneRefs = {
      [EggZone.GameArea]: React.createRef(),
      [EggZone.PageHeader]: React.createRef(),
      [EggZone.PageFooter]: React.createRef(),
      [EggZone.LeftSidebar]: React.createRef(),
      [EggZone.RightSidebar]: React.createRef(),
    };

    this.state = {
      isGameStarted: false,
      isGameOver: false,
      score: 0,
      timeLeft: props.gameDuration,
      eggs: [],
      gameAreaWidth: 0,
      gameAreaHeight: 0,
      zoneDimensions: {
        [EggZone.GameArea]: { width: 0, height: 0 },
        [EggZone.PageHeader]: { width: 0, height: 0 },
        [EggZone.PageFooter]: { width: 0, height: 0 },
        [EggZone.LeftSidebar]: { width: 0, height: 0 },
        [EggZone.RightSidebar]: { width: 0, height: 0 },
      }
    };
  }

  // When component mounts, set up the game area dimensions
  public componentDidMount(): void {
    this.updateZoneDimensions();
    window.addEventListener('resize', this.updateZoneDimensions);
  }

  // Clean up event listeners and timer when component unmounts
  public componentWillUnmount(): void {
    window.removeEventListener('resize', this.updateZoneDimensions);
    this.stopTimer();
  }

  // Update all zone dimensions for responsive design
  private updateZoneDimensions = (): void => {
    const zoneDimensions = { ...this.state.zoneDimensions };
    
    // Update dimensions for each zone
    Object.keys(this.zoneRefs).forEach((zone) => {
      const zoneKey = zone as EggZone;
      const zoneRef = this.zoneRefs[zoneKey];
      
      if (zoneRef.current) {
        zoneDimensions[zoneKey] = {
          width: zoneRef.current.offsetWidth,
          height: zoneRef.current.offsetHeight
        };
      }
    });
    
    // For the game area, also update the state properties
    const gameAreaRef = this.zoneRefs[EggZone.GameArea].current;
    if (gameAreaRef) {
      this.setState({
        gameAreaWidth: gameAreaRef.offsetWidth,
        gameAreaHeight: gameAreaRef.offsetHeight,
        zoneDimensions
      });
    } else {
      this.setState({ zoneDimensions });
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

  // Select a random size for an egg
  private getRandomEggSize = (): EggSize => {
    const sizes = [EggSize.Small, EggSize.Medium, EggSize.Large];
    const randomIndex = Math.floor(Math.random() * sizes.length);
    return sizes[randomIndex];
  }

  // Select a random zone for an egg with weighted distribution
  private getRandomEggZone = (isBonus: boolean): EggZone => {
    // Bonus eggs are more likely to be placed outside the main game area
    if (isBonus) {
      const zones = [
        EggZone.GameArea,
        EggZone.PageHeader,
        EggZone.PageFooter,
        EggZone.LeftSidebar,
        EggZone.RightSidebar
      ];
      const weights = [0.2, 0.2, 0.2, 0.2, 0.2]; // Equal distribution for bonus eggs
      
      return this.weightedRandomChoice(zones, weights);
    } else {
      const zones = [
        EggZone.GameArea,
        EggZone.PageHeader,
        EggZone.PageFooter,
        EggZone.LeftSidebar,
        EggZone.RightSidebar
      ];
      const weights = [0.5, 0.15, 0.15, 0.1, 0.1]; // Main game area has higher probability
      
      return this.weightedRandomChoice(zones, weights);
    }
  }
  
  // Helper function for weighted random selection
  private weightedRandomChoice = <T,>(items: T[], weights: number[]): T => {
    if (items.length !== weights.length) {
      throw new Error('Items and weights must have the same length');
    }
    
    const cumulativeWeights: number[] = [];
    let sum = 0;
    
    for (const weight of weights) {
      sum += weight;
      cumulativeWeights.push(sum);
    }
    
    const random = Math.random() * sum;
    
    for (let i = 0; i < cumulativeWeights.length; i++) {
      if (random < cumulativeWeights[i]) {
        return items[i];
      }
    }
    
    return items[items.length - 1]; // Fallback
  }

  // Generate eggs with random positions, sizes, and zones
  private generateEggs = (): IEgg[] => {
    const eggs: IEgg[] = [];
    const totalEggs = this.props.numberOfEggs + this.props.numberOfBonusEggs;
    const eggSizeMap = {
      [EggSize.Small]: 30,
      [EggSize.Medium]: 45,
      [EggSize.Large]: 60
    };
    
    // Make sure we have zone dimensions
    if (Object.values(this.state.zoneDimensions).some((dim: {width: number, height: number}) => dim.width === 0 && dim.height === 0)) {
      this.updateZoneDimensions();
    }
    
    // Generate regular eggs
    for (let i = 0; i < this.props.numberOfEggs; i++) {
      const eggSize = this.getRandomEggSize();
      const eggZone = this.getRandomEggZone(false);
      const sizePx = eggSizeMap[eggSize];
      
      // Get dimensions for the selected zone
      const zoneDim = this.state.zoneDimensions[eggZone];
      
      // Calculate max X and Y within the zone
      const maxX = Math.max(0, zoneDim.width - sizePx);
      const maxY = Math.max(0, zoneDim.height - sizePx);
      
      eggs.push({
        id: i,
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY),
        isBonus: false,
        isFound: false,
        size: eggSize,
        zone: eggZone
      });
    }
    
    // Generate bonus eggs
    for (let i = this.props.numberOfEggs; i < totalEggs; i++) {
      const eggSize = this.getRandomEggSize();
      const eggZone = this.getRandomEggZone(true);
      const sizePx = eggSizeMap[eggSize];
      
      // Get dimensions for the selected zone
      const zoneDim = this.state.zoneDimensions[eggZone];
      
      // Calculate max X and Y within the zone
      const maxX = Math.max(0, zoneDim.width - sizePx);
      const maxY = Math.max(0, zoneDim.height - sizePx);
      
      eggs.push({
        id: i,
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY),
        isBonus: true,
        isFound: false,
        size: eggSize,
        zone: eggZone
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
      const clickedEgg = prevState.eggs.find((egg: IEgg) => egg.id === eggId);
      let scoreIncrement = 0;
      
      if (clickedEgg && !clickedEgg.isFound) {
        // Base points for regular/bonus eggs
        scoreIncrement = clickedEgg.isBonus ? 5 : 1;
        
        // Size multiplier
        if (clickedEgg.size === EggSize.Small) {
          scoreIncrement *= 3; // Small eggs are worth more (harder to find)
        } else if (clickedEgg.size === EggSize.Medium) {
          scoreIncrement *= 2;
        }
        
        // Zone multiplier for eggs outside the main game area
        if (clickedEgg.zone !== EggZone.GameArea) {
          scoreIncrement *= 1.5; // 50% bonus for eggs outside the main area
        }
      }
      
      const newScore = prevState.score + Math.round(scoreIncrement);
      
      return {
        eggs: updatedEggs,
        score: newScore
      };
      
    }, () => {
      // After state update, check if all eggs are found
      if (this.state.eggs.every((egg: IEgg) => egg.isFound)) {
        this.endGame(); // End game immediately if all eggs found
      }
    });
  }
  
  // Render egg in specific zone
  private renderEggsInZone = (zone: EggZone) => {
    const { eggs } = this.state;
    const zoneEggs = eggs.filter(egg => egg.zone === zone);
    
    return zoneEggs.map(egg => {
      // Set dimension based on egg size
      let eggSizeClass;
      switch(egg.size) {
        case EggSize.Small:
          eggSizeClass = styles.smallEgg;
          break;
        case EggSize.Large:
          eggSizeClass = styles.largeEgg;
          break;
        default:
          eggSizeClass = styles.mediumEgg;
      }
      
      return (
        <div
          key={egg.id}
          className={`${styles.egg} ${eggSizeClass} ${egg.isBonus ? styles.bonusEgg : ''} ${egg.isFound ? styles.eggFound : ''}`}
          style={{
            left: `${egg.x}px`,
            top: `${egg.y}px`
          }}
          onClick={() => !egg.isFound && this.handleEggClick(egg.id)}
          role="button"
          aria-label={`${egg.isBonus ? "Bonus" : "Regular"} Easter egg ${egg.size} size`}
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              !egg.isFound && this.handleEggClick(egg.id);
            }
          }}
        />
      );
    });
  }
  
  // Render game UI
  public render(): React.ReactElement<IEasterEggHuntGameProps> {
    const { hasTeamsContext, userDisplayName } = this.props;
    const { isGameStarted, isGameOver, score, timeLeft } = this.state;
    
    return (
      <section className={`${styles.easterEggHuntGame} ${hasTeamsContext ? styles.teams : ''}`}>
        <div 
          ref={this.zoneRefs[EggZone.PageHeader]} 
          className={styles.pageHeader}>
          <div className={styles.gameHeader}>
            <h2 className={styles.gameTitle}>Easter Egg Hunt Game</h2>
            <p className={styles.welcome}>Welcome, {escape(userDisplayName)}!</p>
          </div>
          {isGameStarted && this.renderEggsInZone(EggZone.PageHeader)}
        </div>
        
        <div className={styles.gameContainer}>
          <div 
            ref={this.zoneRefs[EggZone.LeftSidebar]} 
            className={styles.leftSidebar}>
            {isGameStarted && this.renderEggsInZone(EggZone.LeftSidebar)}
          </div>
          
          <div className={styles.mainContent}>
            <div className={styles.gameInfo}>
              <div className={styles.scoreTimer}>
                <div className={styles.score}>Score: {score}</div>
                <div className={styles.timer}>Time Left: {timeLeft}s</div>
              </div>
              
              {!isGameStarted && !isGameOver && (
                <div className={styles.startGameContainer}>
                  <p className={styles.instructions}>
                    Click "Start Game" to begin hunting for Easter eggs! 
                    Find eggs of different sizes all over the page!
                    <ul>
                      <li>Regular eggs are worth 1-3 points based on size</li>
                      <li>Golden eggs are worth 5-15 points based on size</li>
                      <li>Eggs outside the main game area give 50% bonus points</li>
                      <li>Find all eggs to end the game early!</li>
                    </ul>
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
              ref={this.zoneRefs[EggZone.GameArea]} 
              className={styles.gameArea}
              aria-label="Easter Egg Hunt Game Area"
              role="application"
            >
              {isGameStarted && this.renderEggsInZone(EggZone.GameArea)}
            </div>
          </div>
          
          <div 
            ref={this.zoneRefs[EggZone.RightSidebar]} 
            className={styles.rightSidebar}>
            {isGameStarted && this.renderEggsInZone(EggZone.RightSidebar)}
          </div>
        </div>
        
        <div 
          ref={this.zoneRefs[EggZone.PageFooter]} 
          className={styles.pageFooter}>
          {isGameStarted && this.renderEggsInZone(EggZone.PageFooter)}
          <p className={styles.footerText}>Happy Easter Egg Hunting!</p>
        </div>
      </section>
    );
  }
}
