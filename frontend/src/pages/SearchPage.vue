<script setup>
import { reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import DebateCard from "@/components/DebateCard.vue";
import { useDebatesStore } from "@/stores/debates";

const router = useRouter();
const route = useRoute();
const debatesStore = useDebatesStore();

const filters = reactive({
  q: String(route.query.q || ""),
  sort: "new",
  position: "",
  from: "",
  to: ""
});

const runSearch = async () => {
  await debatesStore.search(filters);
  router.replace({ name: "buscar", query: { q: filters.q || undefined } });
};

const openDebate = (id) => router.push({ name: "debate", params: { id } });

onMounted(runSearch);
</script>

<template>
  <q-page class="q-px-md q-pb-lg">
    <h1 class="section-title q-mt-md q-mb-md">Buscar debates</h1>

    <q-card flat bordered class="debate-surface q-mb-md">
      <q-card-section class="row q-col-gutter-sm">
        <div class="col-12 col-md-4">
          <q-input v-model="filters.q" outlined dense label="Texto" />
        </div>
        <div class="col-6 col-md-2">
          <q-select
            v-model="filters.sort"
            outlined
            dense
            label="Orden"
            :options="[
              { label: 'Más nuevos', value: 'new' },
              { label: 'Más antiguos', value: 'old' },
              { label: 'Más comentarios', value: 'comments' },
              { label: 'Más votos', value: 'votes' }
            ]"
            emit-value
            map-options
          />
        </div>
        <div class="col-6 col-md-2">
          <q-select
            v-model="filters.position"
            outlined
            dense
            label="Posición"
            :options="[
              { label: 'Todas', value: '' },
              { label: 'A favor', value: 'support' },
              { label: 'En contra', value: 'oppose' },
              { label: 'Neutral', value: 'neutral' }
            ]"
            emit-value
            map-options
          />
        </div>
        <div class="col-6 col-md-2">
          <q-input v-model="filters.from" outlined dense type="date" label="Desde" />
        </div>
        <div class="col-6 col-md-2">
          <q-input v-model="filters.to" outlined dense type="date" label="Hasta" />
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn color="primary" unelevated label="Buscar" @click="runSearch" />
      </q-card-actions>
    </q-card>

    <q-skeleton v-if="debatesStore.loadingSearch" type="rect" height="140px" class="q-mb-sm" />
    <DebateCard
      v-for="debate in debatesStore.searchResults"
      :key="debate.id"
      :debate="debate"
      @open="openDebate"
    />
    <q-banner
      v-if="!debatesStore.loadingSearch && debatesStore.searchResults.length === 0"
      rounded
      class="bg-grey-2"
    >
      No se encontraron debates para esos filtros.
    </q-banner>
  </q-page>
</template>
