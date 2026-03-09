<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import HeroSection from "@/components/HeroSection.vue";
import DebateCarousel from "@/components/DebateCarousel.vue";
import DebateCard from "@/components/DebateCard.vue";
import CommunityTodaySection from "@/components/CommunityTodaySection.vue";
import { useDebatesStore } from "@/stores/debates";
import { useUsersStore } from "@/stores/users";
import { useStatsStore } from "@/stores/stats";

const router = useRouter();
const debatesStore = useDebatesStore();
const usersStore = useUsersStore();
const statsStore = useStatsStore();

const openDebate = (id) => router.push({ name: "debate", params: { id } });

const stats = computed(() => ({
  comentariosHoy: statsStore.comentariosHoy,
  participantesHoy: statsStore.participantesHoy,
  debatesActivos: statsStore.debatesActivos,
  votosEmitidos: statsStore.votosEmitidos
}));

onMounted(async () => {
  await Promise.all([debatesStore.fetchToday(), usersStore.fetchTopUsers()]);
  statsStore.computeFromDebates(debatesStore.today, usersStore.topUsers);
});
</script>

<template>
  <q-page class="home-page">
    <HeroSection />

    <DebateCarousel :debates="debatesStore.today" @open="openDebate" />

    <CommunityTodaySection :top-users="usersStore.topUsers" :stats="stats" />

    <div class="q-px-md q-pb-lg home-grid">
      <h2 class="section-title q-mt-none q-mb-md">Debates de hoy</h2>

      <q-banner v-if="debatesStore.error" class="bg-red-1 text-negative q-mb-md" rounded>
        {{ debatesStore.error }}
      </q-banner>

      <q-skeleton v-if="debatesStore.loadingToday" type="rect" height="160px" class="q-mb-md" />
      <DebateCard
        v-for="debate in debatesStore.today"
        :key="debate.id"
        :debate="debate"
        @open="openDebate"
      />
    </div>
  </q-page>
</template>
