import { defineStore } from "pinia";
import { debatesService } from "@/services/debates.service";

export const useDebatesStore = defineStore("debates", {
  state: () => ({
    today: [],
    byId: {},
    commentsByDebate: {},
    searchResults: [],
    trending: [],
    loadingToday: false,
    loadingDebate: false,
    loadingComments: false,
    loadingSearch: false,
    loadingTrending: false,
    error: ""
  }),
  actions: {
    async fetchToday() {
      this.loadingToday = true;
      this.error = "";
      try {
        this.today = await debatesService.getToday();
      } catch (error) {
        this.error = error?.response?.data?.error || "No se pudieron cargar los debates de hoy.";
      } finally {
        this.loadingToday = false;
      }
    },
    async fetchDebate(id) {
      this.loadingDebate = true;
      try {
        const debate = await debatesService.getById(id);
        this.byId[id] = debate;
      } finally {
        this.loadingDebate = false;
      }
    },
    async fetchComments(debateId) {
      this.loadingComments = true;
      try {
        this.commentsByDebate[debateId] = await debatesService.getComments(debateId);
      } finally {
        this.loadingComments = false;
      }
    },
    async createComment({ debateId, content, parentId = null }) {
      const created = await debatesService.postComment({ debateId, content, parentId });
      const current = this.commentsByDebate[debateId] || [];
      this.commentsByDebate[debateId] = [...current, created];
      return created;
    },
    async voteComment({ debateId, commentId }) {
      const updated = await debatesService.voteComment(commentId);
      const current = this.commentsByDebate[debateId] || [];
      this.commentsByDebate[debateId] = current.map((comment) =>
        Number(comment.id) === Number(commentId) ? { ...comment, score: Number(updated.score || comment.score) } : comment
      );
      return updated;
    },
    async setPosition({ debateId, position }) {
      await debatesService.postPosition({ debateId, position });
      await this.fetchDebate(debateId);
      await this.fetchToday();
    },
    async search(params) {
      this.loadingSearch = true;
      try {
        this.searchResults = await debatesService.search(params);
      } finally {
        this.loadingSearch = false;
      }
    },
    async fetchTrending(limit = 10) {
      this.loadingTrending = true;
      try {
        this.trending = await debatesService.getTrending(limit);
      } finally {
        this.loadingTrending = false;
      }
    }
  }
});
