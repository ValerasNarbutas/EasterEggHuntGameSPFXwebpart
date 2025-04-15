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
