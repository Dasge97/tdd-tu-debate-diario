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
  }
});

const emit = defineEmits(["open"]);
const favoritesStore = useFavoritesStore();
const usersStore = useUsersStore();

const toValue = (value) => Math.max(0, Math.min(1, Number(value || 0) / 100));
const isFavorite = computed(() => favoritesStore.favoriteIds.has(Number(props.debate.id)));

const toggleFavorite = async () => {
  if (!usersStore.isAuthenticated) return;
  await favoritesStore.toggle(props.debate.id);
};
</script>

<template>
  <q-card flat bordered class="q-mb-md debate-card debate-surface">
    <q-card-section>
      <div class="text-h6 q-mb-sm debate-title">{{ props.debate.title }}</div>
      <div class="text-body2 text-grey-8 q-mb-md debate-context">{{ props.debate.context }}</div>

      <div class="text-caption text-grey-7 q-mb-xs position-label">Posición de la comunidad</div>
      <div class="q-gutter-y-xs q-mb-sm">
        <div>
          <div class="row justify-between text-caption"><span>A favor</span><span class="metric-positive">{{ props.debate.positions?.favor || 0 }}%</span></div>
          <q-linear-progress rounded size="8px" color="positive" track-color="grey-4" :value="toValue(props.debate.positions?.favor)" />
        </div>
        <div>
          <div class="row justify-between text-caption"><span>En contra</span><span class="metric-negative">{{ props.debate.positions?.contra || 0 }}%</span></div>
          <q-linear-progress rounded size="8px" color="negative" track-color="grey-4" :value="toValue(props.debate.positions?.contra)" />
        </div>
        <div>
          <div class="row justify-between text-caption"><span>Neutral</span><span class="metric-neutral">{{ props.debate.positions?.neutral || 0 }}%</span></div>
          <q-linear-progress rounded size="8px" color="grey-6" track-color="grey-4" :value="toValue(props.debate.positions?.neutral)" />
        </div>
      </div>
    </q-card-section>

    <q-card-actions align="between" class="q-px-md q-pb-md">
      <div class="row items-center q-gutter-sm">
        <div class="text-caption text-grey-7 debate-comments">{{ props.debate.commentCount || 0 }} comentarios</div>
        <q-btn
          v-if="usersStore.isAuthenticated"
          flat
          dense
          size="sm"
          color="amber-9"
          :icon="isFavorite ? 'bookmark' : 'bookmark_border'"
          @click="toggleFavorite"
        />
      </div>
      <q-btn
        v-if="showAction"
        color="primary"
        label="Entrar al debate"
        unelevated
        class="debate-action-btn"
        @click="emit('open', props.debate.id)"
      />
    </q-card-actions>
  </q-card>
</template>
