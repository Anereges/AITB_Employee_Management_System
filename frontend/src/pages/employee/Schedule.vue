<template>
  <div class="schedule-view">
    <h2><i class="fas fa-calendar-alt mr-2"></i>My Schedule</h2>

    <div class="calendar-controls">
      <button @click="prevWeek" aria-label="Previous week" title="Previous Week">
        <i class="fas fa-chevron-left"></i>
      </button>
      <h3>{{ formattedWeekRange }}</h3>
      <button @click="nextWeek" aria-label="Next week" title="Next Week">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <div class="week-view" role="list">
      <div
        v-for="day in weekDays"
        :key="day.fullDate"
        class="day-column"
        :class="{ today: isToday(day.fullDate) }"
        role="listitem"
        :aria-label="`Events for ${day.name}, ${day.date}`"
      >
        <div class="day-header">
          <strong>{{ day.name }}</strong>
          <span>{{ day.date }}</span>
        </div>
        <div class="events">
          <div
            v-for="event in getEventsForDay(day.fullDate)"
            :key="event.id"
            class="event"
            :class="event.type"
            role="article"
            :aria-label="`${event.title} at ${event.time} in ${event.location || 'unspecified location'}`"
          >
            <div class="event-time">
              <i class="far fa-clock"></i> {{ event.time }}
            </div>
            <div class="event-details">
              <strong>{{ event.title }}</strong>
              <p v-if="event.location">{{ event.location }}</p>
            </div>
          </div>
          <p v-if="!getEventsForDay(day.fullDate).length" class="no-events">No events</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const currentDate = ref(new Date());

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // Sunday=0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
};

const weekDays = computed(() => {
  const start = startOfWeek(currentDate.value);
  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString().split('T')[0]
    };
  });
});

const formattedWeekRange = computed(() => {
  const start = startOfWeek(currentDate.value);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const options = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
});

const events = ref([
  {
    id: 1,
    title: 'Team Standup',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 AM',
    duration: '30 mins',
    type: 'meeting',
    location: 'Zoom'
  },
  {
    id: 2,
    title: 'Client Call',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
    time: '02:00 PM',
    duration: '1 hour',
    type: 'call',
    location: 'Conference Room A'
  }
]);

const getEventsForDay = (dayISODate) => {
  return events.value.filter(event => event.date === dayISODate);
};

const prevWeek = () => {
  currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() - 7));
};

const nextWeek = () => {
  currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() + 7));
};

const isToday = (dateISO) => {
  const todayISO = new Date().toISOString().split('T')[0];
  return dateISO === todayISO;
};
</script>

<style scoped>
.schedule-view {
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.calendar-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin: 1.5rem 0;
  font-weight: 600;
  font-size: 1.25rem;
}

.calendar-controls button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #4f46e5;
  transition: color 0.3s ease;
}

.calendar-controls button:hover {
  color: #3730a3;
}

.week-view {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  scroll-behavior: smooth;
}

.day-column {
  min-width: 180px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 6px 15px rgb(0 0 0 / 0.1);
  display: flex;
  flex-direction: column;
  user-select: none;
  border: 3px solid transparent;
  transition: border-color 0.3s ease;
}

.day-column.today {
  border-color: #4f46e5;
  box-shadow: 0 8px 20px rgb(79 70 229 / 0.3);
}

.day-header {
  padding: 0.75rem;
  background: #f5f7fa;
  border-bottom: 1px solid #eee;
  text-align: center;
  font-weight: 700;
  font-size: 1rem;
  color: #4f46e5;
}

.day-header span {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.15rem;
}

.events {
  padding: 0.75rem 0.8rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  max-height: 320px;
}

.event {
  padding: 0.7rem 1rem;
  border-radius: 8px;
  background: #e0e7ff;
  border-left: 5px solid #4a90e2;
  box-shadow: 0 2px 6px rgb(74 144 226 / 0.2);
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  cursor: default;
  transition: background-color 0.3s ease;
}

.event:hover {
  background-color: #c7d2fe;
}

.event.meeting {
  background: #fff0f0;
  border-left-color: #e24a4a;
  box-shadow: 0 2px 6px rgb(226 74 74 / 0.2);
}

.event.call {
  background: #f0fff4;
  border-left-color: #4ae270;
  box-shadow: 0 2px 6px rgb(74 226 112 / 0.2);
}

.event-time {
  font-size: 0.8rem;
  color: #555;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.event-time i {
  color: #4f46e5;
}

.event-details strong {
  font-weight: 700;
  color: #222;
}

.event-details p {
  margin: 0.2rem 0 0 0;
  color: #555;
  font-size: 0.85rem;
}

.no-events {
  font-style: italic;
  color: #999;
  font-size: 0.85rem;
  text-align: center;
  margin-top: 1rem;
}

/* Scrollbar for webkit browsers */
.week-view::-webkit-scrollbar {
  height: 8px;
}

.week-view::-webkit-scrollbar-track {
  background: transparent;
}

.week-view::-webkit-scrollbar-thumb {
  background-color: #a5b4fc;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 600px) {
  .day-column {
    min-width: 140px;
  }
  .calendar-controls h3 {
    font-size: 1rem;
  }
}
</style>
