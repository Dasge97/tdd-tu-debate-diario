<script setup>
import { computed } from "vue";
import { useFavoritesStore } from "@/stores/favorites";
import { useUsersStore } from "@/stores/users";

const props = defineProps({
  debate: {
    type: Object,
    required: true
  },
  showAction: {
    type: Boolean,
    default: true
  },
  showBack: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["open", "back"]);
const favoritesStore = useFavoritesStore();
const usersStore = useUsersStore();

const isFavorite = computed(() => favoritesStore.favoriteIds.has(Number(props.debate.id)));
const favor = computed(() => Math.max(0, Number(props.debate.positions?.favor || 0)));
const contra = computed(() => Math.max(0, Number(props.debate.positions?.contra || 0)));
const neutral = computed(() => Math.max(0, Number(props.debate.positions?.neutral || 0)));
const totalVotes = computed(() => {
  const raw = props.debate.positionsRaw || {};
  return Number(raw.support || 0) + Number(raw.oppose || 0) + Number(raw.neutral || 0);
});

const segmentStyle = (value, color) => ({
  width: `${Math.max(0, Number(value || 0))}%`,
  background: color
});

const toggleFavorite = async () => {
  if (!usersStore.isAuthenticated) return;
  await favoritesStore.toggle(props.debate.id);
};
</script>

<template>
  <q-card flat bordered class="q-mb-md debate-card debate-surface">
    <q-card-section class="debate-card-body">
      <div class="debate-card-main">
        <div class="debate-card-topbar">
          <div class="debate-card-topspacer">
            <button v-if="showBack" type="button" class="debate-inline-back" @click="emit('back')">
              <span class="material-icons">arrow_back</span>
              <span>Volver</span>
            </button>
          </div>
          <q-btn
            v-if="usersStore.isAuthenticated"
            flat
            round
            dense
            size="sm"
            class="debate-favorite-btn"
            :icon="isFavorite ? 'favorite' : 'favorite_border'"
            @click="toggleFavorite"
          />
        </div>

        <div class="text-h6 q-mb-sm debate-title">{{ props.debate.title }}</div>
        <div class="text-body2 text-grey-8 q-mb-md debate-context">{{ props.debate.context }}</div>

        <div class="text-caption text-grey-7 q-mb-xs position-label">Posición de la comunidad</div>
        <div class="debate-segmented-bar q-mb-sm" aria-label="Resultado de posiciones">
          <div class="debate-segment debate-segment-favor" :style="segmentStyle(favor, '#2ecc71')"></div>
          <div class="debate-segment debate-segment-contra" :style="segmentStyle(contra, '#e74c3c')"></div>
          <div class="debate-segment debate-segment-neutral" :style="segmentStyle(neutral, '#bdc3c7')"></div>
        </div>

        <div class="debate-legend q-mb-md">
          <div class="debate-legend-item">
            <span class="debate-legend-dot" style="background:#2ecc71"></span>
            <span>A favor {{ favor }}%</span>
          </div>
          <div class="debate-legend-item">
            <span class="debate-legend-dot" style="background:#e74c3c"></span>
            <span>En contra {{ contra }}%</span>
          </div>
          <div class="debate-legend-item">
            <span class="debate-legend-dot" style="background:#bdc3c7"></span>
            <span>Neutral {{ neutral }}%</span>
          </div>
        </div>

        <div class="debate-card-actions">
          <div class="debate-card-tools">
            <div class="debate-meta-row">
              <div class="debate-meta-item">
                <span class="material-icons debate-meta-icon">people</span>
                <span>{{ totalVotes }} votos</span>
              </div>
              <div class="debate-meta-separator">·</div>
              <div class="debate-meta-item">
                <span class="material-icons debate-meta-icon">chat_bubble_outline</span>
                <span>{{ props.debate.commentCount || 0 }} comentarios</span>
              </div>
            </div>
          </div>
          <q-btn
            v-if="showAction"
            color="primary"
            label="Entrar al debate"
            unelevated
            class="debate-action-btn"
            @click="emit('open', props.debate.id)"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
