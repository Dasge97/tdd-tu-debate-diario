<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { usersService } from "@/services/users.service";
import { useUsersStore } from "@/stores/users";
import { useFriendsStore } from "@/stores/friends";
import { useToastStore } from "@/stores/toast";

const router = useRouter();
const usersStore = useUsersStore();
const friendsStore = useFriendsStore();
const toastStore = useToastStore();

const query = ref("");
const loading = ref(false);
const users = ref([]);
const error = ref("");
const viewingAll = ref(true);
const page = ref(1);
const pageSize = ref(12);
const total = ref(0);
const totalPages = ref(1);

const titleText = computed(() =>
  viewingAll.value ? "Todos los usuarios" : `Resultados para: "${query.value.trim()}"`
);

const loadRelationStatuses = async () => {
  if (!usersStore.isAuthenticated) return;
  await Promise.all(
    users.value
      .filter((user) => Number(user.id) !== Number(usersStore.me?.id))
      .map((user) => friendsStore.fetchStatus(user.id))
  );
};

const fetchUsers = async ({ q = "", all = false, requestedPage = 1 } = {}) => {
  error.value = "";
  loading.value = true;
  try {
    const data = await usersService.search(q, pageSize.value, requestedPage);
    users.value = data.items || [];
    total.value = Number(data.total || 0);
    page.value = Number(data.page || requestedPage || 1);
    totalPages.value = Number(data.totalPages || 1);
    viewingAll.value = all;
    await loadRelationStatuses();
  } catch (e) {
    error.value = e?.response?.data?.error || "No se pudieron cargar usuarios.";
    toastStore.error(error.value);
  } finally {
    loading.value = false;
  }
};

const searchUsers = async () => {
  const q = query.value.trim();
  if (!q) {
    await fetchUsers({ q: "", all: true, requestedPage: 1 });
    return;
  }
  await fetchUsers({ q, all: false, requestedPage: 1 });
};

const showAllUsers = async () => {
  query.value = "";
  await fetchUsers({ q: "", all: true, requestedPage: 1 });
};

const onChangePage = async (nextPage) => {
  const q = query.value.trim();
  await fetchUsers({
    q,
    all: q.length === 0,
    requestedPage: Number(nextPage) || 1
  });
};

const goProfile = (username) => {
  router.push({ name: "perfil", params: { username } });
};

const relationLabel = (userId) => {
  const status = friendsStore.relationStatusByUserId[userId] || "none";
  if (status === "friends") return "Amigos";
  if (status === "pending_sent") return "Solicitud enviada";
  if (status === "pending_received") return "Te envió solicitud";
  if (status === "rejected") return "Solicitud rechazada";
  return "Agregar amigo";
};

const canSendRequest = (userId) => {
  const status = friendsStore.relationStatusByUserId[userId] || "none";
  return status === "none";
};

const sendRequest = async (userId) => {
  if (!usersStore.isAuthenticated) {
    toastStore.info("Inicia sesión para agregar amigos.");
    return;
  }
  try {
    await friendsStore.sendRequest(userId);
    toastStore.success("Solicitud de amistad enviada.");
  } catch (error) {
    toastStore.error(error?.response?.data?.error || "No se pudo enviar la solicitud.");
  }
};

onMounted(showAllUsers);
</script>

<template>
  <q-page class="q-px-md q-pb-lg">
    <h1 class="section-title q-mt-md q-mb-md">Comunidad</h1>

    <q-card flat bordered class="debate-surface q-mb-md community-search-card">
      <q-card-section class="row q-col-gutter-sm items-end">
        <div class="col-12 col-md-7">
          <q-input
            v-model="query"
            outlined
            dense
            label="Buscar usuarios"
            placeholder="username, bio o ubicación"
            @keyup.enter="searchUsers"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-12 col-md-5 row q-gutter-sm">
          <q-btn color="primary" unelevated label="Buscar" @click="searchUsers" />
          <q-btn flat color="primary" label="Ver todos" @click="showAllUsers" />
        </div>
      </q-card-section>
    </q-card>

    <q-banner v-if="error" class="bg-red-1 text-negative q-mb-md" rounded>{{ error }}</q-banner>

    <q-skeleton v-if="loading" type="rect" height="100px" class="q-mb-sm" />

    <div class="text-subtitle2 text-grey-8 q-mb-sm">{{ titleText }}</div>

    <div class="row q-col-gutter-sm">
      <div v-for="user in users" :key="user.id" class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <q-card flat bordered class="debate-surface community-user-card">
          <q-card-section class="row items-start no-wrap q-col-gutter-sm community-user-card-section">
            <div class="col-auto">
              <q-avatar size="34px" color="primary" text-color="white">
                <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="`Avatar de ${user.username}`" />
                <span v-else>{{ (user.username || '?').slice(0, 1).toUpperCase() }}</span>
              </q-avatar>
            </div>
            <div class="col">
              <div class="text-weight-bold cursor-pointer compact-username" @click="goProfile(user.username)">
                @{{ user.username }}
              </div>
              <div class="text-caption text-grey-7 ellipsis-2-lines compact-bio">
                {{ user.bio || "Sin bio" }}
              </div>
              <div class="text-caption text-grey-6 compact-location">
                {{ user.location || "Ubicación no disponible" }}
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="between" class="q-pt-none q-px-sm q-pb-sm">
            <q-chip dense color="grey-3" text-color="dark" class="compact-chip">
              Criterio: {{ user.reliabilityScore || 0 }}
            </q-chip>
            <q-btn
              v-if="usersStore.me && Number(user.id) !== Number(usersStore.me.id)"
              size="sm"
              dense
              :color="canSendRequest(user.id) ? 'primary' : 'grey-7'"
              :disable="!canSendRequest(user.id)"
              :label="relationLabel(user.id)"
              @click="sendRequest(user.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <div v-if="!loading && totalPages > 1" class="row justify-center q-mt-md">
      <q-pagination
        :model-value="page"
        :max="totalPages"
        :max-pages="7"
        direction-links
        boundary-links
        color="primary"
        @update:model-value="onChangePage"
      />
    </div>

    <div v-if="!loading && users.length > 0" class="text-caption text-grey-7 text-center q-mt-sm">
      Mostrando {{ users.length }} de {{ total }} usuarios
    </div>

    <q-banner v-if="!loading && users.length === 0" rounded class="bg-grey-2 q-mt-sm">
      No se encontraron usuarios.
    </q-banner>
  </q-page>
</template>
