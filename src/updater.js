// LocalScribe intentionally ships without an update feed. Keeping this small
// manager preserves the IPC contract until the settings UI is removed while
// guaranteeing that no startup, manual, or periodic update request is made.
class UpdateManager {
  setWindowManager(windowManager) {
    this.windowManager = windowManager;
  }

  async checkForUpdates() {
    return { updateAvailable: false, message: "Updates are disabled for this local build" };
  }

  async downloadUpdate() {
    return { success: false, message: "Updates are disabled for this local build" };
  }

  async installUpdate() {
    return { success: false, message: "Updates are disabled for this local build" };
  }

  async getAppVersion() {
    const { app } = require("electron");
    return { version: app.getVersion() };
  }

  async getUpdateStatus() {
    return {
      updateAvailable: false,
      updateDownloaded: false,
      isDevelopment: process.env.NODE_ENV === "development",
      disabled: true,
    };
  }

  async getUpdateInfo() {
    return null;
  }

  checkForUpdatesOnStartup() {}

  cleanup() {}
}

module.exports = UpdateManager;
