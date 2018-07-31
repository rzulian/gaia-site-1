<template>
  <div class="home text-center container">
    <div class="card">
      <div class="card-body">
        <h2>An online implementation of the Gaia Project board game</h2>
        <p>Official website <a href="https://www.zmangames.com/en/products/gaia-project/" target="_blank">here</a> (<a href="https://boardgamegeek.com/boardgame/220308/gaia-project" target="_blank">BGG</a><!--, <a href="https://images-cdn.zmangames.com/us-east-1/filer_public/ce/89/ce890bfd-227e-4249-a52a-976bc5f20d19/en_gaia_rulebook_lo.pdf" target="_blank">rules</a>-->)</p>
      </div>
    </div>  
    <br/>
    <router-link class="btn btn-lg btn-secondary" to="/new-game">New Game</router-link>
  </div>
</template>

<style lang="scss" scoped>
  .card {
    //background-color: gainsboro
  }
</style>
