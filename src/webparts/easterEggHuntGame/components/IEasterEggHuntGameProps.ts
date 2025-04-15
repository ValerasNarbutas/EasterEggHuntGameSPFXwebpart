export interface IEasterEggHuntGameProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  // Game settings
  gameDuration: number; // in seconds
  numberOfEggs: number;
  numberOfBonusEggs: number;
}

// Define egg size variations
export enum EggSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}

// Define possible egg placement zones
export enum EggZone {
  GameArea = 'gameArea',    // Main game area
  PageHeader = 'pageHeader', // Top of the page
  PageFooter = 'pageFooter', // Bottom of the page
  LeftSidebar = 'leftSidebar', // Left side of the page
  RightSidebar = 'rightSidebar' // Right side of the page
}
