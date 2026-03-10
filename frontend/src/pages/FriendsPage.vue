<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useFriendsStore } from "@/stores/friends";
import { useUsersStore } from "@/stores/users";
import { useChatStore } from "@/stores/chat";

const router = useRouter();
const friendsStore = useFriendsStore();
const usersStore = useUsersStore();
const chatStore = useChatStore();

onMounted(async () => {
  if (!usersStore.isAuthenticated) return;
  await Promise.all([friendsStore.fetchFriends(), friendsStore.fetchRequests()]);
});

const goProfile = (username) => {
  router.push({ name: "perfil", params: { username } });
};
</script>

<template>
  <q-page class="q-px-md q-pb-lg">
    <h1 class="section-title q-mt-md q-mb-md">Amigos</h1>

    <q-banner v-if="!usersStore.isAuthenticated" rounded class="bg-amber-1 text-amber-10 q-mb-md">
      Inicia sesión para ver y gestionar tus amistades.
    </q-banner>

    <div v-else class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered class="debate-surface">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium">Solicitudes recibidas</div>
          </q-card-section>
          <q-list separator>
            <q-item v-for="request in friendsStore.requests" :key="request.id">
              <q-item-section avatar>
                <q-avatar size="36px" color="primary" text-color="white">
                  <img v-if="request.user.avatarUrl" :src="request.user.avatarUrl" :alt="`Avatar de ${request.user.username}`" />
                  <span v-else>{{ (request.user.username || '?').slice(0, 1).toUpperCase() }}</span>
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="cursor-pointer" @click="goProfile(request.user.username)">@{{ request.user.username }}</q-item-label>
                <q-item-label caption>{{ request.user.bio || 'Sin bio' }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row q-gutter-xs no-wrap">
                  <q-btn size="sm" color="positive" flat label="Aceptar" @click="friendsStore.accept(request.requesterId)" />
                  <q-btn size="sm" color="negative" flat label="Rechazar" @click="friendsStore.reject(request.requesterId)" />
                </div>
              </q-item-section>
            </q-item>
            <q-item v-if="friendsStore.requests.length === 0">
              <q-item-section>
                <q-item-label caption>No tienes solicitudes pendientes.</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered class="debate-surface">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium">Tus amigos</div>
          </q-card-section>
          <q-list separator>
            <q-item v-for="friend in friendsStore.friends" :key="friend.id">
              <q-item-section avatar>
                <q-avatar size="36px" color="primary" text-color="white">
                  <img v-if="friend.avatarUrl" :src="friend.avatarUrl" :alt="`Avatar de ${friend.username}`" />
                  <span v-else>{{ (friend.username || '?').slice(0, 1).toUpperCase() }}</span>
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="cursor-pointer" @click="goProfile(friend.username)">@{{ friend.username }}</q-item-label>
                <q-item-label caption>{{ friend.bio || 'Sin bio' }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row q-gutter-xs no-wrap">
                  <q-btn size="sm" flat color="primary" label="Chatear" @click="chatStore.openConversationByUser(friend.id)" />
                  <q-btn size="sm" flat color="negative" label="Eliminar" @click="friendsStore.remove(friend.id)" />
                </div>
              </q-item-section>
            </q-item>
            <q-item v-if="friendsStore.friends.length === 0">
              <q-item-section>
                <q-item-label caption>Aún no tienes amigos agregados.</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>
