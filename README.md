# Matchy Dungeon

Matchy Dungeon is a turn-based dungeon crawler game with roguelite elements where you fight monsters using match-3 mechanics. It is inspired by games like Slay the Spire combined with Candy Crush.

## Design Pillars

<table>
  <tr>
    <th>Match-3 Combat</th>
    <th>Roguelite Elements</th>
    <th>Resource Management</th>
    <th>Strategic Decisions</th>
  </tr>
  <tr>
    <td valign="top">The core combat mechanic is match-3. The player must match cells of the same type to execute attacks or defend. Enemies can interact with the grid to disrupt the player's strategy.</td>
    <td valign="top">The game is procedurally generated, and the player must make decisions that will affect the outcome of the run. The player can find relics and trinkets that will help them in their journey.</td>
    <td valign="top">The player must manage their health to survive the dungeon. They can also collect coins to spend in shops or events they come across.</td>
    <td valign="top">The player must make decisions that will affect the outcome of the combat. They need to plan their moves carefully to defeat the enemies.</td>
  </tr>
</table>

## Audience and Market

Matchy Dungeon is targeted at players who enjoy turn-based combat games and roguelike games. The game is designed to be challenging and rewarding for players who like strategy and planning.

The game strategic elements makes it more appealing to teen-to-adult players.

## Game Mechanics

### Progression

The game is divided into runs, where the player must progress through a series of levels (one in MVP), defeating enemies and bosses along the way. Each run is procedurally generated, meaning that the layout of the dungeon, the enemies, and the items found will be different each time.

### Combat

The combat is turn-based and the player must use their grid to match cells of the same type.

When a player matches cells, they execute a move that can have different effects depending on the type of cell matched.

The player has move points that are used when executing moves.

When the player runs out of move points, their turn ends. Enemies will then execute their moves based on their patterns (see more in the [ennemies section](#enemies)).

#### Player Grid

The player has a 5x5 grid of cells. The grid is filled with different types of cells, such as attack, defense, and utility cells.

Enemies can also interact with the grid, adding their own cells or removing the player's cells with their moves.

#### Cell Deck

The player has a deck of cells that they can use during combat. The deck is made up of different types of cells, such as attack, defense, and utility cells. The player can customize their deck by adding or removing cells, allowing them to tailor their strategy to their playstyle.

Each time a cell is removed from the grid or used, it is stored in a discard pile. The discard is shuffled and added back to the grid when the player runs out of cells in their grid.

#### Status Effects

Players or enemies can be affected by status effects that can modify their stats or the player grid. Status effects can be positive (like buffs) or negative (like debuffs).

#### Moves

Moves are the actions that the player or enemies can execute during combat.

The player uses the grid to match cells and execute moves. Each move has a specific effect, such as dealing damage, applying a status effect, or modifying the grid.

The enemy moves are predefined and can be seen by the player before they execute them, allowing the player to plan their strategy accordingly.

#### Enemies

Enemies have patterns that determine what moves they will do once the player's turn is over. Their next move is displayed to the player, allowing them to plan their strategy accordingly.

Ennemies can directly affect the player (by attacking or applying status effects) or the player's grid by adding their own cells, removing player's cells, or execute special moves that affect the grid.

#### Rewards

After defeating all the enemies, the player can receive rewards such as coins and trinkets. They also have the option to choose a new move to add to their grid or upgrade an existing move.

### Resources

- **Health:** The player has a health pool that is reduced when they take damage from enemies. If the player's health reaches zero, the game is over.
- **Move Points:** The player has a limited number of move points that are used to execute moves during combat. The player can regain move points by matching certain cells or using items, move points are refilled at the start of each turn.
- **Coins:** The player can collect coins during their run. Coins can be used to buy items in shops or events.
- **Relics:** The player can find relics that provide passive bonuses or special abilities. Relics are permanent for the run and can significantly change the player's strategy.
- **Trinkets:** The player can find trinkets that provide temporary bonuses or special abilities. Trinkets are consumed after use and can be used to turn the tide of battle.

### Map

#### Generation

The dungeon is procedurally generated, meaning that the layout of the dungeon, the enemies, and the items found will be different each time. The player will navigate through a series of encounters or battles, each with its own challenges and rewards.

#### Encounters
