<template>
    <div class="auth-layout">
      <div class="auth-container">
        <!-- Auth content will go here (e.g., login, register forms) -->
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .auth-layout {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f7f7f7; /* Light background for auth pages */
  }
  
  .auth-container {
    width: 100%;
    max-width: 400px;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  /* Optional styling for the auth form container */
  .auth-container h2 {
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
    color: #333;
  }
  </style>
  