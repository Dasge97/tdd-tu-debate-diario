<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import DebateCard from "@/components/DebateCard.vue";
import RightSidebar from "@/components/RightSidebar.vue";
import { useDebatesStore } from "@/stores/debates";
import { useUsersStore } from "@/stores/users";
import { useStatsStore } from "@/stores/stats";

const route = useRoute();
const router = useRouter();
const debatesStore = useDebatesStore();
const usersStore = useUsersStore();
const statsStore = useStatsStore();

const debateId = computed(() => Number(route.params.id));
const newComment = ref("");
const position = ref("");
const commentError = ref("");

const debate = computed(() => debatesStore.byId[debateId.value]);
const comments = computed(() => debatesStore.commentsByDebate[debateId.value] || []);
const stats = computed(() => ({
  comentariosHoy: statsStore.comentariosHoy,
  participantesHoy: statsStore.participantesHoy,
  debatesActivos: statsStore.debatesActivos,
  votosEmitidos: statsStore.votosEmitidos
}));

const load = async () => {
  if (!Number.isInteger(debateId.value) || debateId.value <= 0) {
    router.push({ name: "home" });
    return;
  }
  await Promise.all([
    debatesStore.fetchToday(),
    debatesStore.fetchDebate(debateId.value),
    debatesStore.fetchComments(debateId.value),
    usersStore.fetchTopUsers()
  ]);
  statsStore.computeFromDebates(debatesStore.today, usersStore.topUsers);
};

const submitComment = async () => {
  commentError.value = "";
  if (!usersStore.isAuthenticated) {
    commentError.value = "Debes iniciar sesión para comentar.";
    return;
  }
  if (!newComment.value.trim()) {
    commentError.value = "Escribe un comentario antes de enviar.";
    return;
  }
  try {
    await debatesStore.createComment({
      debateId: debateId.value,
      content: newComment.value.trim()
    });
    newComment.value = "";
  } catch (error) {
    commentError.value = error?.response?.data?.error || "No se pudo publicar el comentario.";
  }
};

const submitPosition = async () => {
  if (!usersStore.isAuthenticated) {
    commentError.value = "Debes iniciar sesión para elegir una posición.";
    return;
  }
  if (!position.value) return;
  try {
    await debatesStore.setPosition({ debateId: debateId.value, position: position.value });
  } catch (error) {
    commentError.value = error?.response?.data?.error || "No se pudo registrar tu posición.";
  }
};

const voteComment = async (commentId) => {
  if (!usersStore.isAuthenticated) {
    commentError.value = "Debes iniciar sesión para votar comentarios.";
    return;
  }
  try {
    await debatesStore.voteComment({ debateId: debateId.value, commentId });
  } catch (error) {
    commentError.value = error?.response?.data?.error || "No se pudo votar el comentario.";
  }
};

watch(() => route.params.id, load);
onMounted(load);
</script>

<template>
  <q-page>
    <div class="row q-col-gutter-lg q-px-md q-pb-lg">
      <div class="col-12 col-lg-8">
        <q-btn flat icon="arrow_back" label="Volver" class="q-mb-md" @click="router.push({ name: 'home' })" />

        <q-skeleton v-if="debatesStore.loadingDebate" type="rect" height="220px" />
        <DebateCard v-else-if="debate" :debate="debate" :show-action="false" />

        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">Tu posición en el debate</div>
            <q-btn-toggle
              v-model="position"
              spread
              unelevated
              toggle-color="primary"
              :options="[
                { label: 'A favor', value: 'support' },
                { label: 'En contra', value: 'oppose' },
                { label: 'Neutral', value: 'neutral' }
              ]"
            />
            <q-btn class="q-mt-sm" color="primary" unelevated label="Guardar posición" @click="submitPosition" />
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">Comentarios</div>
            <q-input v-model="newComment" type="textarea" outlined autogrow placeholder="Escribe tu comentario" />
            <div v-if="commentError" class="text-negative text-caption q-mt-sm">{{ commentError }}</div>
            <q-btn class="q-mt-sm" color="primary" unelevated label="Publicar comentario" @click="submitComment" />
          </q-card-section>
        </q-card>

        <q-list bordered separator>
          <q-item v-for="comment in comments" :key="comment.id">
            <q-item-section>
              <q-item-label class="text-weight-medium">@{{ comment.username }}</q-item-label>
              <q-item-label caption>{{ comment.content }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row items-center q-gutter-xs no-wrap">
                <q-chip dense color="grey-3" text-color="dark">+{{ comment.score }}</q-chip>
                <q-btn
                  flat
                  dense
                  size="sm"
                  color="primary"
                  icon="thumb_up"
                  @click="voteComment(comment.id)"
                />
              </div>
            </q-item-section>
          </q-item>
          <q-item v-if="comments.length === 0">
            <q-item-section>
              <q-item-label caption>Todavía no hay comentarios en este debate.</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <div class="col-12 col-lg-4">
        <RightSidebar :top-users="usersStore.topUsers" :stats="stats" />
      </div>
    </div>
  </q-page>
</template>
