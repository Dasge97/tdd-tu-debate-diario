<script setup>
import { computed } from "vue";

const now = new Date();
const dia = computed(() =>
  now.toLocaleDateString("es-ES", { weekday: "long" }).toUpperCase()
);
const fecha = computed(() => {
  const numero = now.getDate();
  const mes = now.toLocaleDateString("es-ES", { month: "long" }).toUpperCase();
  return `${numero} DE ${mes}`;
});
</script>

<template>
  <section class="hero-section q-px-md q-py-xl">
    <div class="text-center q-mx-auto" style="max-width: 880px">
      <div class="hero-kicker">PLAZA PÚBLICA DIGITAL</div>
      <h1 class="hero-title">Tu Debate Diario</h1>
      <p class="hero-subtitle">Cinco debates sobre la actualidad. Opiniones con criterio.</p>
      <div class="hero-date q-mt-xl">
        <div class="hero-day">{{ dia }}</div>
        <div class="hero-full-date">{{ fecha }}</div>
      </div>
    </div>
  </section>
</template>
