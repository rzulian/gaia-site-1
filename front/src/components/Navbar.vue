<template>
  <nav class="navbar navbar-dark bg-primary navbar-expand-sm navbar-fixed-top mb-3" id="navbar">
    <router-link class="navbar-brand" to="/">Gaia Project</router-link>

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
        <li class="nav-item" v-if="!user"><span class="navbar-text">Have an account ?</span></li>
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
        <li class="nav-item" v-if="user">
          <router-link class="nav-link" to="/account">{{user.account.username || user.account.email}}</router-link>
        </li>
        <li class="nav-item" v-if="admin">
          <router-link class="nav-link" to="/admin">Admin</router-link>
        </li>
        <li class="nav-item" v-if="user">
          <a class="nav-link" href="/signout" @click.prevent="signout">Log out</a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script lang="ts">
import $ from 'jquery';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IAbstractUser } from '@lib/user';
import { handleError } from '@/utils';

@Component
export default class Navbar extends Vue {
  password = "";
  email = "";

  login() {
    $.post('/api/account/login', {email: this.email, password: this.password}).then(
      (data: {user: IAbstractUser | null, sessionID: string}) => { 
        this.$store.commit('updateUser', data); 
        this.hideDropdown();
      },
      err => handleError(err)
    );
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

  get user(): IAbstractUser | null {
    return this.$store.state.user;
  }

  get admin(): boolean {
    return this.$store.getters.admin;
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

</style>
