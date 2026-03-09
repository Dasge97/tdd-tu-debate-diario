<script setup>
import { reactive } from "vue";

const form = reactive({
  title: "",
  context: "",
  tags: ""
});
</script>

<template>
  <q-page class="q-px-md q-pb-lg">
    <h1 class="section-title q-mt-md q-mb-md">Proponer debate</h1>

    <q-card flat bordered class="debate-surface" style="max-width: 860px;">
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-xs">Propuesta para revisión editorial</div>
        <div class="text-caption text-grey-7 q-mb-md">
          Esta funcionalidad está en construcción. Puedes preparar tu propuesta y guardarla más adelante.
        </div>

        <q-input v-model="form.title" outlined label="Título del debate" class="q-mb-sm" />
        <q-input
          v-model="form.context"
          outlined
          type="textarea"
          autogrow
          label="Contexto breve"
          class="q-mb-sm"
        />
        <q-input v-model="form.tags" outlined label="Etiquetas (opcional)" class="q-mb-sm" />

        <div class="row q-gutter-sm q-mt-sm">
          <q-btn color="primary" unelevated label="Guardar borrador" disable />
          <q-btn flat color="primary" label="Enviar propuesta" disable />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>
