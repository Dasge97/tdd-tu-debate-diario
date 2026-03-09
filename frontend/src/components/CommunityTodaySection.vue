<script setup>
import { computed } from "vue";

const props = defineProps({
  topUsers: {
    type: Array,
    default: () => []
  },
  stats: {
    type: Object,
    required: true
  }
});

const hasUsers = computed(() => props.topUsers.length > 0);
const hasStats = computed(() => {
  const values = [
    Number(props.stats?.comentariosHoy || 0),
    Number(props.stats?.participantesHoy || 0),
    Number(props.stats?.debatesActivos || 0),
    Number(props.stats?.votosEmitidos || 0)
  ];
  return values.some((value) => value > 0);
});
</script>

<template>
  <section class="community-section q-px-md q-pb-lg">
    <h2 class="section-title q-mt-none q-mb-md">La comunidad hoy</h2>

    <div class="row q-col-gutter-md items-stretch">
      <div class="col-12 col-md-6 community-col">
        <q-card flat bordered class="debate-surface community-card full-width">
          <q-card-section class="community-card-header">
            <div class="text-overline text-grey-7 panel-heading">Voces con criterio</div>
          </q-card-section>
          <q-card-section class="community-card-content">
            <q-list dense v-if="hasUsers">
              <q-item v-for="user in topUsers" :key="user.id || user.username" class="voice-item">
                <q-item-section>
                  <q-item-label class="voice-name">{{ user.username || user.name }}</q-item-label>
                  <q-item-label caption>
                    Índice de criterio: {{ user.reliabilityScore ?? user.reliability_score ?? user.score ?? 0 }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="community-placeholder">Aún no hay datos disponibles</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6 community-col">
        <q-card flat bordered class="debate-surface community-card full-width">
          <q-card-section class="community-card-header">
            <div class="text-overline text-grey-7 panel-heading">Actividad del día</div>
          </q-card-section>
          <q-card-section class="community-card-content">
            <q-list dense v-if="hasStats">
              <q-item class="stat-item">
                <q-item-section>Comentarios hoy</q-item-section>
                <q-item-section side>{{ stats.comentariosHoy }}</q-item-section>
              </q-item>
              <q-item class="stat-item">
                <q-item-section>Participantes hoy</q-item-section>
                <q-item-section side>{{ stats.participantesHoy }}</q-item-section>
              </q-item>
              <q-item class="stat-item">
                <q-item-section>Debates activos</q-item-section>
                <q-item-section side>{{ stats.debatesActivos }}</q-item-section>
              </q-item>
              <q-item class="stat-item">
                <q-item-section>Votos emitidos</q-item-section>
                <q-item-section side>{{ stats.votosEmitidos }}</q-item-section>
              </q-item>
            </q-list>
            <div v-else class="community-placeholder">Aún no hay datos disponibles</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </section>
</template>
