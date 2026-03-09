<script setup>
import { computed, onMounted, reactive, watch } from "vue";
import { useRoute } from "vue-router";
import { useUsersStore } from "@/stores/users";
import { useFriendsStore } from "@/stores/friends";

const route = useRoute();
const usersStore = useUsersStore();
const friendsStore = useFriendsStore();

const form = reactive({ bio: "", avatarUrl: "", location: "" });

const profile = computed(() => usersStore.profile);
const isOwnProfile = computed(
  () => usersStore.isAuthenticated && usersStore.me?.username === String(route.params.username || "").toLowerCase()
);

const relationStatus = computed(() => {
  if (!profile.value || isOwnProfile.value) return "none";
  return friendsStore.relationStatusByUserId[profile.value.id] || "none";
});

const loadProfile = async () => {
  const username = String(route.params.username || "").trim().toLowerCase();
  if (!username) return;
  await usersStore.fetchProfileByUsername(username);

  if (isOwnProfile.value && usersStore.me) {
    form.bio = usersStore.me.bio || "";
    form.avatarUrl = usersStore.me.avatarUrl || "";
    form.location = usersStore.me.location || "";
  }

  if (usersStore.isAuthenticated && profile.value && !isOwnProfile.value) {
    await friendsStore.fetchStatus(profile.value.id);
  }
};

const saveProfile = async () => {
  await usersStore.updateMe({ bio: form.bio, avatarUrl: form.avatarUrl, location: form.location });
  await loadProfile();
};

const sendRequest = async () => {
  if (!profile.value) return;
  await friendsStore.sendRequest(profile.value.id);
};

const acceptRequest = async () => {
  if (!profile.value) return;
  await friendsStore.accept(profile.value.id);
};

const rejectRequest = async () => {
  if (!profile.value) return;
  await friendsStore.reject(profile.value.id);
};

const removeFriend = async () => {
  if (!profile.value) return;
  await friendsStore.remove(profile.value.id);
};

watch(() => route.params.username, loadProfile);
onMounted(async () => {
  if (usersStore.isAuthenticated && !usersStore.me) await usersStore.fetchMe();
  await loadProfile();
});
</script>

<template>
  <q-page class="q-px-md q-pb-lg">
    <q-card flat bordered class="debate-surface q-mt-md">
      <q-card-section>
        <div class="row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-avatar size="72px" color="primary" text-color="white">
              {{ (profile?.username || '?').slice(0, 1).toUpperCase() }}
            </q-avatar>
          </div>
          <div class="col">
            <div class="text-h5">@{{ profile?.username }}</div>
            <div class="text-body2 text-grey-7">{{ profile?.bio || 'Sin bio por ahora.' }}</div>
            <div class="text-caption text-grey-6 q-mt-xs">{{ profile?.location || 'Ubicación no especificada' }}</div>
            <div class="text-caption text-grey-6">Índice de criterio: {{ profile?.reliabilityScore || 0 }}</div>
          </div>
          <div class="col-auto" v-if="!isOwnProfile && usersStore.isAuthenticated">
            <div class="row q-gutter-xs">
              <q-btn
                v-if="relationStatus === 'none'"
                color="primary"
                unelevated
                label="Agregar amigo"
                @click="sendRequest"
              />
              <q-btn
                v-else-if="relationStatus === 'pending_received'"
                color="positive"
                unelevated
                label="Aceptar solicitud"
                @click="acceptRequest"
              />
              <q-btn
                v-if="relationStatus === 'pending_received'"
                flat
                color="negative"
                label="Rechazar"
                @click="rejectRequest"
              />
              <q-btn
                v-else-if="relationStatus === 'pending_sent'"
                color="grey-7"
                unelevated
                disable
                label="Solicitud enviada"
              />
              <q-btn
                v-else-if="relationStatus === 'friends'"
                flat
                color="negative"
                label="Eliminar amigo"
                @click="removeFriend"
              />
              <q-btn
                v-else-if="relationStatus === 'rejected'"
                color="grey-7"
                unelevated
                disable
                label="Solicitud rechazada"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card v-if="isOwnProfile" flat bordered class="debate-surface q-mt-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-sm">Editar perfil</div>
        <q-input v-model="form.bio" outlined type="textarea" autogrow label="Bio" maxlength="280" class="q-mb-sm" />
        <q-input v-model="form.location" outlined label="Ubicación" class="q-mb-sm" />
        <q-input v-model="form.avatarUrl" outlined label="URL de avatar" class="q-mb-sm" />
        <q-btn color="primary" unelevated label="Guardar cambios" @click="saveProfile" />
      </q-card-section>
    </q-card>
  </q-page>
</template>
