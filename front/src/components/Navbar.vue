<template>
  <nav class="navbar navbar-dark bg-primary navbar-expand navbar-fixed-top mb-md-3 mb-1" id="navbar">
    <router-link class="navbar-brand" to="/"><span @click="navbarClick">Gaia Project</span></router-link>
    <router-link :class="['btn', 'btn-sm', 'mr-auto', {'btn-success': activeGames.length > 0, 'btn-secondary': activeGames.length === 0}]"  to="/next-game" v-if="user" title="Jump to next active game" id="active-game-count">
      {{activeGames.length}}
    </router-link>

    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Menu déroulant de navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <!-- <ul class="navbar-nav mr-auto">
        <li class="nav-item">
          <router-link class="nav-link" to="/about">About</router-link>
        </li>
      </ul>-->
      <ul class="navbar-nav ml-auto">
        <li class="nav-item d-none d-sm-inline" v-if="!user"><span class="navbar-text">Have an account ?</span></li>
        <li class="nav-item dropdown" v-if="!user">
          <a href="/login" class="nav-link navbar-text dropdown-toggle" data-toggle="dropdown" id="loginDropDown">Login</a>
          <div id="login-dp" class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdown-menu">
            <div class="row">
              <div class="col-md-12">
                <!-- <div class="alert alert-warning" role="alert" v-if="error">
                  {{errorText}}
                </div> -->
                Log in with
                <form class="form mt-2" role="form" method="post" action="/login" @submit.prevent="login" accept-charset="UTF-8" id="login-nav">
                  <div class="form-group">
                    <label class="sr-only" for="email">Email</label>
                    <input type="email" class="form-control" id="email" placeholder="Email address" name="email" v-model="email" required>
                  </div>
                  <div class="form-group">
                    <label class="sr-only" for="password">Password</label>
                    <input type="password" class="form-control" id="password" placeholder="Password" name="password" v-model="password" required>
                    <div class="help-block text-right mt-1"><router-link to="/forgotten-password">Forgotten password ?</router-link></div>
                  </div>
                  <input type="hidden" name="referrer" value="<%= req.originalUrl %>">
                  <div class="form-group">
                    <button type="submit" class="btn btn-primary btn-block">Log in</button>
                  </div>
                  <!-- <div class="checkbox">
                    <label>
                      <input type="checkbox"> keep me logged-in
                    </label>
                  </div> -->
                </form>
              </div>
              <div class="bottom text-center">
                New ? <router-link to="/signup"><b>Join us</b></router-link>
              </div>
            </div>
          </div>
        </li>
        <li class="nav-item" v-if="admin">
          <router-link class="nav-link" to="/admin" title="Admin">
            <span class="fa fa-cogs"></span>
            <span class="d-none d-md-inline ml-1">Admin</span>
          </router-link>
        </li>
        <li class="nav-item" v-if="user">
          <router-link class="nav-link" to="/account" title="Account">
            <span class="fa fa-user"></span>
            <span class="d-none d-md-inline ml-1">{{user.account.username || user.account.email}}</span>
          </router-link>
        </li>
        <li class="nav-item" v-if="user">
          <a class="nav-link" href="/signout" @click.prevent="signout" title="Log out">
            <span class="fa fa-sign-out"></span>
            <span class="d-none d-md-inline ml-1">Log out</span>
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script lang="ts">
import $ from 'jquery';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError } from '@/utils';
import { User } from '@/types';

@Component({
  created() {
    this.interval = setInterval(() => this.refreshActiveGames(), 20000);
    this.mutationSubscription = (this.$store as any).subscribe(({type, payload}) => {
      if (type === 'updateUser') {
        if (this.user && !this.hasUser) {
          this.refreshActiveGames();
        }
      }
    });

    if (this.activeGames.length > 0) {
      $("#favicon-site").attr("href", "/favicon-active.png");
    } else {
      $("#favicon-site").attr("href", "/favicon.png");
    }
  },
  destroyed() {
    clearInterval(this.interval);
    this.mutationSubscription();
  }, 
  watch: {
    activeGames(newVal, oldVal) {
      if (newVal.length > 0 && oldVal.length === 0) {
        $("#favicon-site").attr("href", "/favicon-active.png");
        if (this.user.settings.game.soundNotification) {
          (document.querySelector("#sound-notification") as HTMLAudioElement).play();
        }
      } else {
        $("#favicon-site").attr("href", "/favicon.png");
      }
    }
  }
})
export default class Navbar extends Vue {
  password = "";
  email = "";
  interval: number = 0;
  hasUser = false;

  login() {
    $.post('/api/account/login', {email: this.email, password: this.password}).then(
      (data: {user: User, sessionID: string}) => { 
        this.$store.commit('updateUser', data); 
        this.hideDropdown();
      },
      err => handleError(err)
    );
  }

  navbarClick() {
    this.$store.dispatch("logoClick");
  }

  signout() {
    $.post('/api/account/signout').then(
      () => {
        if (this.$route.meta.loggedIn) {
          this.$router.push('/');
        }
        this.$store.commit('updateUser', null);
      },
      err => handleError(err)
    );
  }

  hideDropdown() {
    $('#loginDropDown').trigger('click');
  }

  get user(): User {
    return this.$store.state.user;
  }

  get activeGames(): string[] {
    return this.$store.state.activeGames;
  }

  get admin(): boolean {
    return this.$store.getters.admin;
  }

  async refreshActiveGames() {
    const user = this.user;
    this.hasUser = !!user;

    if (!user) {
      return;
    }

    try {
      const activeGames =  await $.get(`/api/user/${user._id}/games/current-turn`);
      this.$store.commit("activeGames", activeGames.map(game => game._id));
    } catch (err) {
      handleError(err);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "../stylesheets/main.scss";

#navbar a.nav-link.router-link-exact-active {
  color: $navbar-dark-active-color
}

.navbar .nav-item .dropdown-menu {
  margin-top: 0.5rem;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
}

#login-dp{
  min-width: 250px;
  padding: 14px 14px 0;
  overflow:hidden;
  background-color:rgba(255,255,255,.8);
}
#login-dp .help-block{
  font-size:12px
}
#login-dp .bottom{
  background-color:rgba(255,255,255,.8);
  border-top:1px solid #ddd;
  clear:both;
  padding:14px;
}
#login-dp .social-buttons{
  margin:12px 0
}
#login-dp .social-buttons a{
  width: 49%;
}
#login-dp .form-group {
  margin-bottom: 10px;
}

#active-game-count {
  border-radius: 50%; 
  padding: 0.1rem 0.5rem;
}

@-moz-document url-prefix() {
  #active-game-count {
    margin-top: 0.1rem
  }
}

</style>
