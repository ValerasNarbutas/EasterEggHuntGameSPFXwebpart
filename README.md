# Easter Egg Hunt Game SPFx Webpart

## Summary

A fun interactive Easter Egg Hunt Game built as a SharePoint Framework web part. This web part creates an engaging, festive activity that allows users to hunt for hidden Easter eggs across a SharePoint page. The game includes regular and bonus eggs with different point values, and eggs can be placed both inside the web part and around other elements on the SharePoint page.

![Easter Egg Hunt Game in action](./src/webparts/easterEggHuntGame/assets/easter-egg-game-preview.png)

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.20.0-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

- SharePoint Online tenant
- Node.js v16 or later
- Gulp

## Solution

| Solution              | Author(s)                                       |
|-----------------------|-------------------------------------------------|
| Easter Egg Hunt Game  | Your Name (Your Company)                        |

## Version history

| Version | Date             | Comments                                    |
|---------|------------------|--------------------------------------------|
| 1.0     | April 15, 2025   | Initial release                            |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Navigate to the solution folder
- Run the following commands:
  ```bash
  npm install
  gulp bundle
  gulp package-solution
  ```
- Upload the solution package to your app catalog
- Add the app to your site
- Add the web part to a page

## Features

This Easter Egg Hunt Game SPFx web part offers the following features:

- **Interactive Gameplay**: Users can hunt for eggs by clicking on them when found
- **Multiple Egg Types**: Regular eggs and bonus eggs with different point values
- **Various Egg Sizes**: Small, medium, and large eggs with different point multipliers
- **Cross-Page Integration**: Eggs can appear both inside the web part and on external page elements
- **Configurable Settings**: Customize game duration, number of eggs, and bonus eggs
- **Responsive Design**: Works well on various screen sizes
- **Accessible Design**: Support for keyboard navigation and screen readers
- **Score Tracking**: Keep track of found eggs and total score
- **Timer**: Game ends when time runs out or all eggs are found

### Configuration Options

The web part includes the following configuration options:

- **Game Duration**: Set the length of the game in seconds
- **Number of Eggs**: Set how many regular eggs to generate
- **Number of Bonus Eggs**: Set how many golden bonus eggs to generate
- **Show Game Area**: Toggle whether to show the main game area
- **External CSS Classes**: Define classes of external page elements where eggs can appear (semicolon-separated)

## Usage

1. Add the web part to a SharePoint page
2. Configure the game settings in the property pane
3. If you want eggs to appear outside the web part, add external CSS classes
4. Click "Start Game" to begin
5. Hunt for eggs throughout the page
6. Game ends when all eggs are found or time runs out

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
