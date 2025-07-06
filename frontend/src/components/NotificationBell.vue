<template>
  <div class="notification-wrapper">
    <v-badge
      :content="unreadCount"
      :value="unreadCount"
      color="red"
      overlap
      bordered
    >
      <v-btn
        icon
        @click="toggleNotifications"
      >
        <v-icon>mdi-bell</v-icon>
      </v-btn>
    </v-badge>

    <v-menu
      v-model="showNotifications"
      :close-on-content-click="false"
      offset-y
      nudge-bottom="10"
      max-width="350"
    >
      <v-card>
        <v-toolbar dense flat color="primary" dark>
          <v-toolbar-title>Notifications</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon
            small
            @click="markAllRead"
            :disabled="unreadCount === 0"
          >
            <v-icon>mdi-check-all</v-icon>
          </v-btn>
        </v-toolbar>

        <v-tabs v-model="tab" grow>
          <v-tab>Approvals ({{ pendingApprovals.length }})</v-tab>
          <v-tab>Alerts ({{ unreadCount }})</v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab">
          <v-tab-item>
            <v-list v-if="pendingApprovals.length > 0" dense>
              <v-list-item
                v-for="employee in pendingApprovals"
                :key="employee.id"
              >
                <v-list-item-avatar>
                  <v-img :src="employee.avatar || defaultAvatar"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ employee.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ employee.email }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>
                    Registered: {{ formatDate(employee.createdAt) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn
                    small
                    color="success"
                    @click.stop="approveEmployee(employee.id)"
                  >
                    Approve
                  </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn
                    small
                    color="error"
                    @click.stop="rejectEmployee(employee.id)"
                  >
                    Reject
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <v-card-text v-else class="text-center">
              No pending approvals
            </v-card-text>
          </v-tab-item>

          <v-tab-item>
            <v-list v-if="notifications.length > 0" dense>
              <v-list-item
                v-for="notification in notifications"
                :key="notification.id"
                @click="markAsRead(notification.id)"
                :class="{ 'grey lighten-4': !notification.read }"
              >
                <v-list-item-icon>
                  <v-icon
                    :color="getNotificationIconColor(notification.type)"
                  >
                    {{ getNotificationIcon(notification.type) }}
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ notification.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ notification.message }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle class="caption">
                    {{ formatTimeAgo(notification.createdAt) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-card-text v-else class="text-center">
              No notifications
            </v-card-text>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default {
  data() {
    return {
      showNotifications: false,
      tab: 0,
      defaultAvatar: require('@/assets/default-avatar.png'),
      pollInterval: null
    };
  },
  computed: {
    ...mapState('employee', ['pendingApprovals', 'notifications']),
    ...mapGetters('employee', ['unreadCount'])
  },
  methods: {
    ...mapActions('employee', [
      'fetchPendingApprovals',
      'approveEmployee',
      'rejectEmployee',
      'fetchNotifications',
      'markNotificationRead',
      'markAllNotificationsRead'
    ]),
    
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
      if (this.showNotifications) {
        this.fetchData();
      }
    },
    
    async fetchData() {
      await Promise.all([
        this.fetchPendingApprovals(),
        this.fetchNotifications()
      ]);
    },
    
    formatDate(date) {
      return dayjs(date).format('DD MMM YYYY');
    },
    
    formatTimeAgo(date) {
      return dayjs(date).fromNow();
    },
    
    getNotificationIcon(type) {
      const icons = {
        info: 'mdi-information',
        warning: 'mdi-alert',
        error: 'mdi-alert-circle',
        success: 'mdi-check-circle'
      };
      return icons[type] || 'mdi-bell';
    },
    
    getNotificationIconColor(type) {
      const colors = {
        info: 'info',
        warning: 'warning',
        error: 'error',
        success: 'success'
      };
      return colors[type] || 'primary';
    },
    
    async markAsRead(id) {
      await this.markNotificationRead(id);
    },
    
    async markAllRead() {
      await this.markAllNotificationsRead();
    }
  },
  
  created() {
    this.fetchData();
    // Set up polling every 30 seconds
    this.pollInterval = setInterval(this.fetchData, 30000);
  },
  
  beforeDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }
};
</script>

<style scoped>
.notification-wrapper {
  position: relative;
}
.v-list-item {
  cursor: pointer;
}
</style>