<template>
  <div class="container account">
    <h1>Account</h1>
    <p v-if="user.account.username">Welcome, <strong>{{user.account.username}}</strong>!</p>
    <form>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" class="form-control" id="email" name="email" placeholder="Email address" v-model="email" disabled required>
        <small v-if="user.security.confirmed">Your account is confirmed</small>
        <small v-else>Your email is not confirmed.</small>
      </div>
      <div class="form-check">
        <input type="checkbox" name="newsletter" id="signup-newsletter" class="form-check-input" v-model="newsletter" @change="updateAccountDebounce">
        <label class="form-check-label form-text" for="signup-newsletter">Receive news by email, at most one email every two months</label>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IAbstractUser } from '@lib/user';
import { handleError } from '@/utils';
import debounce from 'lodash.debounce';
import $ from 'jquery';

@Component
export default class Account extends Vue {
  email: string = '';
  newsletter: boolean = false;

  constructor() {
    super();

    this.email = this.user.account.email;
    this.newsletter = !!this.user.account.newsletter;
    this.updateAccount.bind(this);
  }

  get user(): IAbstractUser {
    return this.$store.state.user;
  }

  updateAccount() {
    console.log(this, this.newsletter);
    $.post('/api/account', {
      account: {
        newsletter: this.newsletter
      }
    }).then(
      ({user}) => this.$store.commit('updateUser', user),
      err => handleError(err)
    );
  }

  updateAccountDebounce = debounce(this.updateAccount, 800, {leading: true});
}
</script>
