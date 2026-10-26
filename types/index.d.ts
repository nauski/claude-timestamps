declare module 'claude-code' {
  interface PluginState {
    timestamps: {
      // transcript row uuid -> epoch ms when this session stored it
      times: Record<string, number>
    }
  }
}
