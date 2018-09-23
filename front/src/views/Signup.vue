<template>
  <div class="signup container">
    <h1>Create an account</h1>
     <b-alert variant="warning" v-if="inviteOnly" show>
      
        Due to circumstances outside of our control, we cannot open the website to the public for quite a <i>very long</i> time.
        As such, only the lucky few with invitations can create an account here.
      
        We are very sorry!
    </b-alert>
    <form method="post" @submit.prevent="submit" class="clearfix">
      <div class="form-group">
        <label for="signup-username">Username</label>
        <input type="text" class="form-control" id="signup-username" name="username" placeholder="Username" aria-describedby="emailHelp" v-model.trim="username" required>
      </div>
      <div class="form-group">
        <label for="signup-email">Email address</label>
        <input type="email" class="form-control" id="signup-email" name="email" placeholder="Email" aria-describedby="emailHelp" v-model.trim="email" :disabled="inviteOnly" required>
        <small id="emailHelp" class="form-text text-muted">We will never share your email without <b>explicit</b> consent.</small>
      </div>
      <div class="form-group" v-if="inviteOnly">
        <label for="invite-code">Invitation Code</label>
        <input type="text" class="form-control" id="invite-code" name="invite-code" placeholder="CODE" aria-describedby="inviteHelp" v-model.trim="inviteCode" required disabled>
        <small id="inviteHelp" class="form-text text-muted">This code is filled in automatically if you follow the link in the invitation email.</small>
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
        <label class="form-check-label form-text" for="signup-newsletter">Get newsletter, up to six emails per year.</label>
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

@Component({
  mounted() {
    this.inviteCode = this.$route.query.code;
    this.email = this.$route.query.user;
  }
})
export default class Signup extends Vue {
  submit() {
    if (this.password !== this.passwordConfirm) {
      handleError("The two passwords don't match");
      return;
    }

    if (this.inviteOnly && !this.inviteCode) {
      handleError("Unfortunately, you need an invitation to join!");
      return;
    }

    const {email, password, newsletter, username, inviteCode} = this;

    $.post('/api/account/signup', {email, username, password, newsletter, inviteCode}).then(
      data => this.$store.commit('updateUser', data),
      err => handleError(err)
    )
  }

  get inviteOnly() {
    return !!process.env.VUE_APP_inviteOnly;
  }

  password = "";
  passwordConfirm = "";
  inviteCode = "";
  email = "";
  username = "";
  newsletter = false;
}
</script>

<style lang="scss" scoped>
  
</style>
