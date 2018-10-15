<template>
  <div class="container text-justify">
    <h2>Spaceship Expansion Rules</h2>
    <div v-html="content">

    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component';
import * as marked from "marked";

marked.setOptions({sanitize: true, breaks: true});

@Component
export default class Rules extends Vue {
  get title() {
    return rules.title;
  }
  get content() {
    return marked(rules.content);
  }
}

const rules = {
  title: "Spaceship Expansion Rules",
  content: `
### Components

- 1 Shipping Tech Track Board
- 15 Stackable and nesting Trade Tokens in each faction color
- 3 Spaceships in each faction color
- 1 Advanced Spaceship
- 3 New Standard Tech Tiles for Shipping (4 each)
- 1 Starting Shipping Tech Tile for each player
- 6 Advanced Tech Tiles
- 2 Round Scoring
- 3 Booster Tiles
- 2 Final Scoring
- 15 Action Tokens

### Purpose

The focus of this expansion to Gaia Project will be interplanetary and inter-faction trade using moving spaceships to transport goods from one faction’s mines to another faction’s buildings. It maintains the perfect information, peaceful expansion, economic strategy, and area control of the game.

### Setup

Each player at the start of the game receives a free starting tech tile which contains an action to move all of their spaceships. Initial Spaceships are placed at setup after all starting mines are placed in this setup order.

- Mines: 1,2,3,4,4,3,2,1,Xeno 3rd,Swarm PI. 
- Ships: 1,2,3,4
- Boosters 4,3,2,1. 

### Game Play and Tech Tracks

During the game any available Spaceships are automatically generated on the faction's Mines (or the Swarm PI) during the income phase in turn order. The number of spaceships gained in the income phase is determined by the level of the Trading Volume research track. Each faction has a maximum of 15 trade tokens that they can use during the game. You cannot use a ship as a starting point of navigation to build a mine or place a Gaiaformer. You can move a ship onto an empty planet to create a mine, paying the costs to build the mine (including terraforming or gaia costs) and remove the ship to your supply.

Spaceships generally move at the faction’s current navigation level when a player takes their Move Spaceships action. The number of spaceships that move is determined by the level of the Trading Volume research track. A player may spend 1 QIC to add +2 navigation for all Spaceships during their Move action. A player may also spend 1pw per Spaceship to move each Spaceship up to 1 navigation hex further. A Spaceship may move through planets (like standard Navigation) and end a turn in empty space if they have enough navigation.

Lantids may use Mines shared with other players after their PI is built to generate spaceships. Lantids may also deliver to the same planet when using their move action but not move the spaceship. Lantids can’t receive a spaceship at a shared planet.

When spaceships arrive at another faction's planet they perform a trade as follows.

1. Receive a Trade Bonus reward based on Trade Bonus tech level and other rewards from round, boosters or techs.
2. The opposing faction receives a power charge based on their building size OR 1 power token in Bowl 1.
3. Place a trade token at that planet. A player may not deliver to the same location again.
4. Remove the Spaceship from the board until the next income phase.

#### Trading Bonus Tech Levels

This is thematically based on the quality of the goods traded.

- Level 0: Each time you deliver a trade, gain two knowledge.
- Level 1: Each time you deliver a trade, gain two knowledge or three coins.
- Level 2: Each time you deliver a trade, gain two knowledge or three coins. Gain a tech tile.
- Level 3: Each time you deliver a trade, gain two knowledge, one ore or three coins.
- Level 4: Each time you deliver a trade, gain two knowledge, one ore, three coins or a Q.I.C. Gain a tech tile.
- Level 5: Each time you deliver a trade, gain two of: two knowledge, one ore, three coins, a Q.I.C.

#### Trading Volume Tech Levels 

This is the thematically based on how many goods the faction can create and sell. The level indicates both spaceship income and how many you can move. So you could have more spaceships on the board than you can move unless a player uses the power action mentioned later.

- Level 0: One spacehip income. The move action moves one spaceship moves at current range.
- Level 1: One spacehip income. The move action moves one spaceship moves at current range + 1.
- Level 2: Two spaceships income. The move action moves two spaceships at current range + 1.
- Level 3: Two spaceships income. The move action moves two spaceships at current range + 2.
- Level 4: Three spaceships income. The move action moves three spaceships at current range + 2. Advance on the navigation or intelligence research track by one level.
- Level 5: Three spaceships income. The move action moves three spaceships at current range + 3. Gain a special federation token with no vp that gives a 4th ship: Advanced Spaceship.

### Standard and Advanced Tech Tiles

With 2 additional tech tracks this will add a standard tech tile for each track and one additional wild card tech tile. These will be shuffled in with the original tech tiles and randomized among all 12 slots. The Spaceship Advanced Tech Tiles will be shuffled in with the rest of the advanced tech tiles.
#### Standard Tech Tiles

1. 2vp for each Shipping Delivery you make
2. Action: pay 1k for a +2 Navigation boost to build a mine or place a gaiaformer
3. Gain 1k per planet with a trade token up to 8k (so if someone gave you a lot of trade you can benefit from this)

#### Advanced Tech Tiles
1. Gain 1vp per all tech levels
2. Gain 1vp per Trade Token placed
3. Gain up to 4 Tech Steps from Level 0 to Level 1
4. Gain 2 Spaceships and move them with +4 Navigation
5. Action: Gain 5vp
6. Action: Gain 1 QIC, 1 Ore, and Take 2 Actions


### Round Scoring, Booster Tiles, Final Scoring, Power/QIC Actions

#### Round scorings
1. 4vp per Spaceship Delivery
2. 3vp per Spaceship Delivery

#### Booster Tiles
1. +3vp when making a delivery and Action: +1 Navigation for mine/GF
2. +1 spaceship, Move-all action.
3. 1vp per Highest Tech Level when passing, +2k income

#### Final Scoring
1. Most Trade Tokens
2. Highest Culture Level (i.e. too much math)
a. Power Level of Buildings (including modifiers from 4pw PI/A Tech Tiles, Mad Android/Bescods PI, Swarm/Ivit Space Stations, and other future modifiers)
b. Each 2 Satellites  = 1 pw
c. Each Federation Token = 3 pw
d. Each Spaceship Income = 1 pw
e. Each Gaiaformer = 1pw
f. Each L5 or Adv Tech = 1pw

#### Power/QIC Actions
1. Spend 3pw to move ALL spaceships
2. Spend 3pw to gain 1 QIC
3. Spend 5pw for +3 Navigation to place a mine or Gaiaformer
4. Spend 1 QIC to generate 1 spaceship
  `
};

</script>
