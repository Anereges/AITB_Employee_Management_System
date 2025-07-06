<template>
    <div class="unauthorized-container">
      <h1>Unauthorized Access</h1>
      <p>You don't have permission to access this page.</p>
      <router-link to="/login" class="back-btn">Return to Login</router-link>
      <button @click="goBack" class="back-btn">Go Back</button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Unauthorized',
    methods: {
      goBack() {
        this.$router.go(-1);
      }
    }
  }
  </script>
  
  <style scoped>
  .unauthorized-container {
    text-align: center;
    padding: 50px 20px;
  }
  
  .back-btn {
    display: inline-block;
    margin: 10px;
    padding: 10px 20px;
    background-color: #13c581;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .back-btn:hover {
    background-color: #1fecd1;
  }
  </style>