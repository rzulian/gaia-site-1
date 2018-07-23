<template>
  <div class="signup container">
    <h1>Create an account</h1>
    <form method="post" @submit.prevent="submit" class="clearfix">
      <div class="form-group">
        <label for="signup-email">Email address</label>
        <input type="email" class="form-control" id="signup-email" name="username" placeholder="Email" aria-describedby="emailHelp" v-model.trim="email" required>
        <small id="emailHelp" class="form-text text-muted">We will never share your email without <b>explicit</b> consent.</small>
      </div>
      <div class="form-row">
        <div class="form-group col-md-6">
          <label for="signup-password">Password</label>
          <input type="password" class="form-control" id="signup-password" name="password" placeholder="Password" v-model="password" required>
        </div>
        <div class="form-group col-md-6">
          <label for="signup-password-confirm">Confirm <span class="d-md-none">password</span></label>
          <input type="password" class="form-control" id="signup-password-confirm" name="password-confirm" placeholder="Password" v-model="passwordConfirm" required>
        </div>
      </div>
      <div class="form-check">
        <input type="checkbox" name="newsletter" id="signup-newsletter" class="form-check-input" v-model="newsletter">
        <label class="form-check-label form-text" for="signup-newsletter">Get newsletter, at most one email every two month.</label>
      </div>

      <input type="hidden" name="action" value="signup">
      <button id="signup-button" class="btn btn-primary pull-right mt-3" type="submit">Register</button>
    </form>

    <hr>
    
    <p>Already an account? <router-link to="/login">Log in</router-link></p>
    <p>Or head <router-link to="/">home</router-link>.</p>
  </div>
</template>

<script lang="ts">
import $ from 'jquery';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IAbstractUser } from '../../../lib/user';
import { handleError } from '@/utils';

@Component
export default class Signup extends Vue {
  submit() {
    if (this.password !== this.passwordConfirm) {
      handleError("The two passwords don't match");
      return;
    }

    const {email, password, newsletter} = this;

    $.post('/api/account/signup', {email, password, newsletter}).then(
      ({user}: {user: IAbstractUser | null}) => this.$store.commit('updateUser', user),
      err => handleError(err)
    )
  }

  password = "";
  passwordConfirm = "";
  email = "";
  newsletter = false;
}
</script>

<style lang="scss" scoped>
  
</style>
